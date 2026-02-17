"""
PresetLoaderService - Sequenced database inserts with progress tracking
Loads presets from JSON files in the correct order with tenant isolation
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

# Get the presets directory path
PRESETS_DIR = Path(__file__).parent


class PresetLoaderService:
    """
    Service for loading presets with sequenced database inserts and progress tracking
    """
    
    def __init__(self, tenant, user=None):
        """
        Initialize the service
        
        Args:
            tenant: Tenant instance
            user: User instance (for created_by field)
        """
        self.tenant = tenant
        self.user = user
        self.presets_dir = PRESETS_DIR
        self.progress = None  # Will be set when loading starts
        
    def load_presets(
        self,
        country_code: str,
        industry_code: Optional[str] = None,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, any]:
        """
        Load all presets in the correct sequence with progress tracking
        
        Sequence:
        1. Currencies
        2. Tax Categories → Tax Codes
        3. Account Types → Chart of Accounts
        
        Args:
            country_code: ISO 3166-1 alpha-2 country code
            industry_code: Optional industry classification code
            progress_callback: Optional callback for progress updates
        
        Returns:
            Dictionary with results and record counts
        """
        from tenants.models import TenantOnboardingProgress
        
        # Get or create progress tracking
        self.progress, _ = TenantOnboardingProgress.objects.get_or_create(
            tenant=self.tenant
        )
        
        results = {
            'currencies': 0,
            'tax_categories': 0,
            'tax_codes': 0,
            'account_types': 0,
            'chart_of_accounts': 0,
            'errors': []
        }
        
        try:
            # Step 1: Load Currencies
            logger.info(f"Loading currencies for tenant {self.tenant.id}, country={country_code}")
            currencies_count = self._load_currencies(country_code, industry_code)
            results['currencies'] = currencies_count
            self._update_progress('currencies', currencies_count, currencies_count, 'completed')
            if progress_callback:
                progress_callback('currencies', 20, currencies_count)
            
            # Step 2: Load Tax Categories then Tax Codes
            logger.info(f"Loading tax categories and codes for tenant {self.tenant.id}, country={country_code}")
            tax_categories_count, tax_codes_count = self._load_tax_data(country_code, industry_code)
            results['tax_categories'] = tax_categories_count
            results['tax_codes'] = tax_codes_count
            self._update_progress('tax_categories', tax_categories_count, tax_categories_count, 'completed')
            self._update_progress('tax_codes', tax_codes_count, tax_codes_count, 'completed')
            if progress_callback:
                progress_callback('tax_data', 50, tax_categories_count + tax_codes_count)
            
            # Step 3: Load Account Types then Chart of Accounts
            logger.info(f"Loading account types and chart of accounts for tenant {self.tenant.id}, country={country_code}, industry={industry_code}")
            account_types_count, chart_of_accounts_count = self._load_accounting_data(country_code, industry_code)
            results['account_types'] = account_types_count
            results['chart_of_accounts'] = chart_of_accounts_count
            self._update_progress('account_types', account_types_count, account_types_count, 'completed')
            self._update_progress('chart_of_accounts', chart_of_accounts_count, chart_of_accounts_count, 'completed')
            if progress_callback:
                progress_callback('accounting_data', 100, account_types_count + chart_of_accounts_count)
            
            logger.info(
                f"Preset loading completed for tenant {self.tenant.id}: "
                f"{currencies_count} currencies, {tax_categories_count} tax categories, "
                f"{tax_codes_count} tax codes, {account_types_count} account types, "
                f"{chart_of_accounts_count} chart of accounts"
            )
            
        except Exception as e:
            logger.error(f"Error loading presets for tenant {self.tenant.id}: {e}", exc_info=True)
            results['errors'].append(str(e))
            raise
        
        return results
    
    def _load_json_file(self, file_path: str) -> Optional[dict]:
        """Load JSON file from presets directory"""
        full_path = self.presets_dir / file_path
        if not full_path.exists():
            return None
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading JSON file {file_path}: {e}")
            return None
    
    def _load_currencies(self, country_code: str, industry_code: Optional[str] = None) -> int:
        """
        Step 1: Load currencies
        
        Args:
            country_code: Country code
            industry_code: Optional industry code
        
        Returns:
            Number of currencies created
        """
        from fx_conversion.models import Currency
        
        # Try to load currency JSON file
        # Priority: {industry_code}_{country_code}.json → {country_code}.json → default
        currency_paths = []
        if industry_code:
            currency_paths.append(f"currencies/{industry_code}_{country_code}.json")
        currency_paths.append(f"currencies/{country_code}.json")
        currency_paths.append("currencies/SEA.json")  # Fallback
        
        currency_data = None
        for path in currency_paths:
            currency_data = self._load_json_file(path)
            if currency_data:
                break
        
        if not currency_data:
            # Create default currency based on country
            currency_map = {
                'SG': 'SGD', 'MY': 'MYR', 'TH': 'THB', 'ID': 'IDR',
                'PH': 'PHP', 'VN': 'VND', 'MM': 'MMK', 'KH': 'KHR',
                'LA': 'LAK', 'BN': 'BND', 'US': 'USD', 'GB': 'GBP',
                'AU': 'AUD', 'CA': 'CAD', 'JP': 'JPY', 'CN': 'CNY',
            }
            currency_code = currency_map.get(country_code, 'USD')
            currency_data = {
                'currencies': [{
                    'code': currency_code,
                    'symbol': '$' if currency_code == 'USD' else currency_code,
                    'name': f'{currency_code} Currency',
                    'is_base': True
                }]
            }
        
        currencies_created = 0
        base_currency_code = None
        
        # Determine base currency: MYR for Malaysia, first currency with is_base=True, or country default
        if country_code == 'MY':
            base_currency_code = 'MYR'
        else:
            # Find base currency from JSON
            for currency_info in currency_data.get('currencies', []):
                if currency_info.get('is_base', False):
                    base_currency_code = currency_info['code']
                    break
            # If no base found, use first currency
            if not base_currency_code and currency_data.get('currencies'):
                base_currency_code = currency_data['currencies'][0]['code']
        
        with transaction.atomic():
            for currency_info in currency_data.get('currencies', []):
                currency_code = currency_info['code']
                is_base = (currency_code == base_currency_code)
                
                # Ensure tenant_id is hardcoded
                currency, created = Currency.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    code=currency_code,
                    defaults={
                        'name': currency_info.get('name', currency_code),
                        'symbol': currency_info.get('symbol', currency_code),
                        'is_base_currency': is_base,
                        'decimal_places': currency_info.get('decimal_places', 2),
                        'is_active': True,
                    }
                )
                
                # Update base currency flag if needed
                if is_base and not currency.is_base_currency:
                    Currency.objects.filter(
                        tenant=self.tenant,
                        is_base_currency=True
                    ).exclude(id=currency.id).update(is_base_currency=False)
                    currency.is_base_currency = True
                    currency.save()
                
                if created:
                    currencies_created += 1
            
            # Create ExchangeRate records using default_rate_to_usd triangulation
            from fx_conversion.models import ExchangeRate
            from django.utils import timezone
            
            base_rate_to_usd = None
            # Find base currency's rate to USD
            for currency_info in currency_data.get('currencies', []):
                if currency_info['code'] == base_currency_code:
                    base_rate_to_usd = Decimal(str(currency_info.get('default_rate_to_usd', 1.0)))
                    break
            
            if not base_rate_to_usd:
                base_rate_to_usd = Decimal('1.0')
            
            # Create exchange rates for all currencies to base currency
            # Formula: If base is MYR (4.72 to USD) and currency is USD (1.0 to USD)
            # To convert USD -> MYR: USD_amount * (MYR_rate_to_usd / USD_rate_to_usd) = USD_amount * (4.72 / 1.0) = USD_amount * 4.72
            # So rate from USD to MYR = base_rate_to_usd / currency_rate_to_usd
            for currency_info in currency_data.get('currencies', []):
                currency_code = currency_info['code']
                if currency_code == base_currency_code:
                    continue  # Skip base currency
                
                currency_rate_to_usd = Decimal(str(currency_info.get('default_rate_to_usd', 1.0)))
                
                # Calculate rate: from_currency -> base_currency
                # Example: MYR base (4.72), USD currency (1.0)
                # Rate USD->MYR = 4.72 / 1.0 = 4.72
                # So $10 USD * 4.72 = 47.20 MYR ✓
                if currency_rate_to_usd > 0:
                    exchange_rate = base_rate_to_usd / currency_rate_to_usd
                else:
                    exchange_rate = Decimal('1.0')
                
                ExchangeRate.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    from_currency=currency_code,
                    to_currency=base_currency_code,
                    valid_from=timezone.now(),
                    defaults={
                        'rate': exchange_rate,
                        'source': 'preset',
                        'provider': 'default',
                        'is_active': True,
                    }
                )
        
        return currencies_created
    
    def _load_tax_data(self, country_code: str, industry_code: Optional[str] = None) -> Tuple[int, int]:
        """
        Step 2: Load tax categories then tax codes
        
        Args:
            country_code: Country code
            industry_code: Optional industry code
        
        Returns:
            Tuple of (tax_categories_count, tax_codes_count)
        """
        from invoicing.models import TaxCategory, TaxCode
        
        # Try to load tax JSON file
        tax_paths = []
        if industry_code:
            tax_paths.append(f"tax_rates/{industry_code}_{country_code}.json")
        tax_paths.append(f"tax_rates/{country_code}.json")
        
        tax_data = None
        for path in tax_paths:
            tax_data = self._load_json_file(path)
            if tax_data:
                break
        
        if not tax_data:
            # Use default structure based on country
            if country_code == 'MY':
                tax_data = {
                    'tax_categories': [
                        {'code': 'SERVICE_TAX', 'name': 'Service Tax (SST)', 'description': 'Standard service tax for Malaysia'},
                        {'code': 'SALES_TAX', 'name': 'Sales Tax', 'description': 'Standard sales tax for manufactured goods'}
                    ],
                    'tax_codes': [
                        {'category': 'SERVICE_TAX', 'code': 'SV-6', 'rate': 6.0, 'description': 'Service Tax 6%'},
                        {'category': 'SERVICE_TAX', 'code': 'SV-8', 'rate': 8.0, 'description': 'Service Tax 8% (New 2024 Rule)'},
                        {'category': 'SALES_TAX', 'code': 'SL-10', 'rate': 10.0, 'description': 'Sales Tax 10%'},
                        {'category': 'SERVICE_TAX', 'code': 'EXEMPT', 'rate': 0.0, 'description': 'Exempted from SST'}
                    ]
                }
            else:
                # Default GST structure
                tax_data = {
                    'tax_categories': [
                        {'code': 'GST', 'name': 'Goods and Services Tax', 'description': 'Standard GST'}
                    ],
                    'tax_codes': [
                        {'category': 'GST', 'code': 'SR', 'rate': 7.0, 'description': 'Standard Rated'},
                        {'category': 'GST', 'code': 'ZR', 'rate': 0.0, 'description': 'Zero Rated'}
                    ]
                }
        
        tax_categories_created = 0
        tax_codes_created = 0
        category_map = {}  # Map category code to TaxCategory instance
        
        with transaction.atomic():
            # First: Create Tax Categories
            for category_info in tax_data.get('tax_categories', []):
                category, created = TaxCategory.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    code=category_info['code'],
                    defaults={
                        'name': category_info.get('name', category_info['code']),
                        'description': category_info.get('description', ''),
                        'is_active': True,
                    }
                )
                category_map[category_info['code']] = category
                if created:
                    tax_categories_created += 1
            
            # Second: Create Tax Codes (linked to categories)
            for code_info in tax_data.get('tax_codes', []):
                category_code = code_info.get('category')
                category = category_map.get(category_code) if category_code else None
                
                if not category:
                    logger.warning(f"Tax code {code_info.get('code')} references unknown category {category_code}")
                    continue
                
                # Determine tax_type from category or code
                tax_type = 'gst' if 'GST' in category_code else 'sales' if 'SALES' in category_code else 'service'
                
                tax_code, created = TaxCode.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    code=code_info['code'],
                    defaults={
                        'name': code_info.get('name', code_info['code']),
                        'tax_type': tax_type,
                        'description': code_info.get('description', ''),
                        'is_system': True,
                        'is_active': True,
                    }
                )
                
                if created:
                    tax_codes_created += 1
                
                # Also create TaxRate record linked to TaxCode
                from invoicing.models import TaxRate
                TaxRate.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    tax_code=tax_code,
                    defaults={
                        'name': tax_code.name,
                        'code': tax_code.code,  # Legacy field
                        'rate': Decimal(str(code_info.get('rate', 0))),
                        'tax_type': tax_type,
                        'region': country_code,
                        'is_default': code_info.get('is_default', False),
                        'is_active': True,
                        'description': tax_code.description,
                        'created_by': self.user,
                    }
                )
        
        return tax_categories_created, tax_codes_created
    
    def _load_accounting_data(self, country_code: str, industry_code: Optional[str] = None) -> Tuple[int, int]:
        """
        Step 3: Load account types then chart of accounts
        
        Args:
            country_code: Country code
            industry_code: Optional industry code
        
        Returns:
            Tuple of (account_types_count, chart_of_accounts_count)
        """
        from accounting.models import GLAccountType, ChartOfAccounts
        
        # Try to load chart of accounts JSON file
        coa_paths = []
        if industry_code and country_code:
            coa_paths.append(f"chart_of_accounts/{industry_code}_{country_code}.json")
        if industry_code:
            coa_paths.append(f"chart_of_accounts/{industry_code}.json")
        coa_paths.append(f"chart_of_accounts/{country_code}.json")
        
        coa_data = None
        for path in coa_paths:
            coa_data = self._load_json_file(path)
            if coa_data:
                break
        
        if not coa_data:
            # Use default structure from user's example
            coa_data = {
                'account_types': [
                    {'code': '1000', 'name': 'Assets', 'report_type': 'Balance Sheet'},
                    {'code': '2000', 'name': 'Liabilities', 'report_type': 'Balance Sheet'},
                    {'code': '3000', 'name': 'Equity', 'report_type': 'Balance Sheet'},
                    {'code': '4000', 'name': 'Revenue', 'report_type': 'Income Statement'},
                    {'code': '5000', 'name': 'Expenses', 'report_type': 'Income Statement'}
                ],
                'chart_of_accounts': [
                    {'code': '1100', 'parent': '1000', 'name': 'Cash and Bank', 'is_selectable': False},
                    {'code': '1101', 'parent': '1100', 'name': 'Main Operating Account', 'is_selectable': True},
                    {'code': '1200', 'parent': '1000', 'name': 'Accounts Receivable', 'is_selectable': True},
                    {'code': '2100', 'parent': '2000', 'name': 'Accounts Payable', 'is_selectable': True},
                    {'code': '4100', 'parent': '4000', 'name': 'SaaS Subscription Revenue', 'is_selectable': True},
                    {'code': '5100', 'parent': '5000', 'name': 'Cost of Goods Sold', 'is_selectable': True}
                ]
            }
        
        account_types_created = 0
        chart_of_accounts_created = 0
        account_type_map = {}  # Map account type code to GLAccountType instance
        account_map = {}  # Map account code to ChartOfAccounts instance
        
        with transaction.atomic():
            # First: Create Account Types
            for type_info in coa_data.get('account_types', []):
                # Map report_type to account type code
                type_code_map = {
                    '1000': 'asset',
                    '2000': 'liability',
                    '3000': 'equity',
                    '4000': 'revenue',
                    '5000': 'expense',
                }
                type_code = type_code_map.get(type_info['code'], 'asset')
                
                # Determine normal balance
                normal_balance_map = {
                    'asset': 'debit',
                    'expense': 'debit',
                    'liability': 'credit',
                    'equity': 'credit',
                    'revenue': 'credit',
                }
                
                account_type, created = GLAccountType.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    code=type_code,
                    defaults={
                        'name': type_info.get('name', type_code.title()),
                        'normal_balance': normal_balance_map.get(type_code, 'debit'),
                        'description': f"{type_info.get('name')} - {type_info.get('report_type', '')}",
                        'is_system': True,
                        'is_active': True,
                        'display_order': int(type_info['code'][0]) if type_info['code'].isdigit() else 0,
                    }
                )
                account_type_map[type_info['code']] = account_type
                if created:
                    account_types_created += 1
            
            # Second: Create Chart of Accounts (linked to account types)
            # Sort by code to ensure parents are created before children
            accounts_to_create = sorted(
                coa_data.get('chart_of_accounts', []),
                key=lambda x: x.get('code', '')
            )
            
            for account_info in accounts_to_create:
                parent_code = account_info.get('parent')
                parent_account = account_map.get(parent_code) if parent_code else None
                
                # Get account type from parent or determine from code
                account_type_code = None
                if parent_code:
                    # Get type from parent's account type
                    if parent_code in account_type_map:
                        account_type_code = account_type_map[parent_code].code
                    else:
                        # Determine from code prefix
                        code_prefix = account_info['code'][0] if account_info['code'] else '1'
                        type_code_map = {
                            '1': 'asset',
                            '2': 'liability',
                            '3': 'equity',
                            '4': 'revenue',
                            '5': 'expense',
                        }
                        account_type_code = type_code_map.get(code_prefix, 'asset')
                else:
                    # Root account, use account type from code
                    code_prefix = account_info['code'][0] if account_info['code'] else '1'
                    type_code_map = {
                        '1': 'asset',
                        '2': 'liability',
                        '3': 'equity',
                        '4': 'revenue',
                        '5': 'expense',
                    }
                    account_type_code = type_code_map.get(code_prefix, 'asset')
                
                account_type_obj = None
                for type_code, gl_type in account_type_map.items():
                    if gl_type.code == account_type_code:
                        account_type_obj = gl_type
                        break
                
                # Determine normal balance
                normal_balance = 'debit' if account_type_code in ['asset', 'expense'] else 'credit'
                
                account, created = ChartOfAccounts.objects.get_or_create(
                    tenant=self.tenant,  # Tenant isolation
                    code=account_info['code'],
                    defaults={
                        'name': account_info.get('name', account_info['code']),
                        'type': account_type_code,  # Legacy field
                        'account_type': account_type_obj,  # FK
                        'parent': parent_account,
                        'description': account_info.get('description', ''),
                        'is_active': account_info.get('is_active', True),
                        'is_system': account_info.get('is_system', not account_info.get('is_selectable', True)),
                        'normal_balance': normal_balance,
                        'created_by': self.user,
                    }
                )
                account_map[account_info['code']] = account
                if created:
                    chart_of_accounts_created += 1
        
        return account_types_created, chart_of_accounts_created
    
    def _update_progress(
        self,
        preset_type: str,
        records_created: int,
        total_expected: int,
        status: str
    ):
        """
        Update TenantOnboardingProgress after each block of inserts
        
        Args:
            preset_type: Type of preset (currencies, tax_categories, etc.)
            records_created: Number of records created
            total_expected: Total expected records
            status: Status (completed, in_progress, failed)
        """
        if self.progress:
            self.progress.update_preset_progress(
                preset_type=preset_type,
                status=status,
                records_created=records_created,
                total_expected=total_expected
            )

