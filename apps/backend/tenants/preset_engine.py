"""
Preset Engine - Auto-provision tenant presets based on industry and country
"""
import json
import os
from typing import Dict, List, Optional, Callable, Tuple
from django.db import transaction
from django.utils import timezone
from .models import Tenant, TenantPreset, Company
import logging

logger = logging.getLogger(__name__)


class PresetEngine:
    """
    Stateless, deterministic preset provisioning engine
    """
    
    def __init__(self):
        self.presets_base_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'presets'
        )
    
    def provision_tenant_presets(
        self,
        tenant: Tenant,
        country_code: str,
        industry_code: Optional[str] = None,
        user=None,
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, any]:
        """
        Provision all presets for a tenant based on country and industry
        
        Args:
            tenant: Tenant instance
            country_code: ISO 3166-1 alpha-2 country code
            industry_code: Optional industry classification code
            user: User who triggered the provisioning (for audit)
            progress_callback: Optional callback function(current_preset, overall_progress, details)
        
        Returns:
            Dict with preset_type -> detailed results including record counts
        """
        # Define all preset types in order (matching PresetLoaderService sequence)
        # Sequence: 1. Currencies, 2. Tax Categories → Tax Codes, 3. Account Types → Chart of Accounts
        preset_types = [
            ('currency', 'Currency'),  # Step 1: Currencies first
            ('tax_categories', 'Tax Categories'),  # Step 2a: Tax Categories
            ('tax_rates', 'Tax Rates'),  # Step 2b: Tax Codes (creates TaxRate records)
            ('account_types', 'Account Types'),  # Step 3a: Account Types
            ('chart_of_accounts', 'Chart of Accounts'),  # Step 3b: Chart of Accounts
            ('invoice_numbering', 'Invoice Numbering'),
            ('einvoice_config', 'E-Invoice Configuration'),
            ('country_settings', 'Country Settings'),
        ]
        
        total_presets = len(preset_types)
        results = {}
        detailed_results = {}
        
        try:
            for index, (preset_type, preset_name) in enumerate(preset_types):
                current_progress = (index / total_presets) * 100
                
                # Call progress callback if provided
                if progress_callback:
                    progress_callback(
                        current_preset=preset_name,
                        overall_progress=current_progress,
                        current_step=index + 1,
                        total_steps=total_presets,
                        details={}
                    )
                
                preset_result = None
                record_count = 0
                
                try:
                    if preset_type == 'chart_of_accounts':
                        preset_result, record_count = self._provision_chart_of_accounts(
                            tenant, country_code, industry_code, user
                        )
                    elif preset_type == 'tax_rates':
                        preset_result, record_count = self._provision_tax_rates(
                            tenant, country_code, user
                        )
                    elif preset_type == 'tax_categories':
                        preset_result, record_count = self._provision_tax_categories(
                            tenant, country_code, user
                        )
                    elif preset_type == 'currency':
                        preset_result, record_count = self._provision_currency(
                            tenant, country_code
                        )
                    elif preset_type == 'invoice_numbering':
                        preset_result, record_count = self._provision_invoice_numbering(
                            tenant, country_code
                        )
                    elif preset_type == 'einvoice_config':
                        preset_result, record_count = self._provision_einvoice_config(
                            tenant, country_code
                        )
                    elif preset_type == 'country_settings':
                        preset_result, record_count = self._provision_country_settings(
                            tenant, country_code
                        )
                    
                    results[preset_type] = preset_result
                    detailed_results[preset_type] = {
                        'success': preset_result,
                        'record_count': record_count,
                        'name': preset_name,
                    }
                    
                    # Update preset progress in TenantOnboardingProgress
                    try:
                        from .models import TenantOnboardingProgress
                        progress, _ = TenantOnboardingProgress.objects.get_or_create(tenant=tenant)
                        status = 'completed' if preset_result else 'failed'
                        progress.update_preset_progress(
                            preset_type=preset_type,
                            status=status,
                            records_created=record_count,
                            total_expected=record_count if preset_result else 0
                        )
                    except Exception as e:
                        logger.warning(f"Failed to update preset progress: {e}")
                    
                except Exception as e:
                    logger.error(f"Failed to provision {preset_type}: {e}")
                    results[preset_type] = False
                    detailed_results[preset_type] = {
                        'success': False,
                        'record_count': 0,
                        'name': preset_name,
                        'error': str(e),
                    }
            
            # Update tenant system flags
            self._update_tenant_flags(tenant, country_code)
            
            # Final progress callback
            if progress_callback:
                progress_callback(
                    current_preset='Complete',
                    overall_progress=100,
                    current_step=total_presets,
                    total_steps=total_presets,
                    details=detailed_results
                )
            
            # Log audit
            logger.info(
                f"Presets provisioned for tenant {tenant.id} "
                f"(country: {country_code}, industry: {industry_code})"
            )
        
        except Exception as e:
            logger.error(f"Failed to provision presets for tenant {tenant.id}: {e}")
            raise
        
        return {
            'results': results,
            'detailed_results': detailed_results,
            'total_presets': total_presets,
            'successful_presets': sum(1 for r in results.values() if r),
        }
    
    def _provision_chart_of_accounts(
        self,
        tenant: Tenant,
        country_code: str,
        industry_code: Optional[str] = None,
        user=None
    ) -> Tuple[bool, int]:
        """Provision Chart of Accounts preset and create actual GL accounts"""
        try:
            from presets.preset_loader_service import PresetLoaderService
            from accounting.models import ChartOfAccounts
            
            # Check if accounts already exist
            existing_count = ChartOfAccounts.objects.filter(tenant=tenant).count()
            if existing_count > 0:
                # Accounts already exist, just update preset metadata
                preset_data = self._get_chart_of_accounts_data(country_code, industry_code)
                TenantPreset.objects.update_or_create(
                    tenant=tenant,
                    preset_type='chart_of_accounts',
                    defaults={
                        'payload': preset_data,
                        'source_country': country_code,
                        'source_industry': industry_code or '',
                        'is_active': True,
                    }
                )
                return True, existing_count
            
            # Use PresetLoaderService for sequenced loading
            loader_service = PresetLoaderService(tenant=tenant, user=user)
            
            # Load accounting data (account types + chart of accounts)
            account_types_count, chart_of_accounts_count = loader_service._load_accounting_data(
                country_code=country_code,
                industry_code=industry_code
            )
            
            record_count = chart_of_accounts_count
            
            # Also save preset metadata
            preset_data = self._get_chart_of_accounts_data(country_code, industry_code)
            if country_code == 'MY':
                preset_data = self._ensure_malaysian_coa_structure(preset_data)
            
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='chart_of_accounts',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'source_industry': industry_code or '',
                    'is_active': True,
                }
            )
            
            return True, record_count
        except Exception as e:
            logger.error(f"Failed to provision chart of accounts: {e}")
            return False, 0
    
    def _get_chart_of_accounts_data(self, country_code: str, industry_code: Optional[str] = None) -> dict:
        """Get chart of accounts JSON data based on industry_code AND country_code"""
        preset_paths = []
        
        # Priority 1: Industry-specific for country (e.g., manufacturing_MY.json)
        if industry_code and country_code:
            preset_paths.append(f"chart_of_accounts/{industry_code}_{country_code}.json")
        
        # Priority 2: Industry-specific (e.g., manufacturing.json)
        if industry_code:
            preset_paths.append(f"chart_of_accounts/{industry_code}.json")
        
        # Priority 3: Country-specific (e.g., MY.json)
        preset_paths.append(f"chart_of_accounts/{country_code}.json")
        
        # Try each path in order
        for path in preset_paths:
            full_path = os.path.join(self.presets_base_path, path)
            if os.path.exists(full_path):
                logger.info(f"Loading Chart of Accounts from: {path}")
                with open(full_path, 'r') as f:
                    return json.load(f)
        
        # Fallback to default
        logger.warning(f"No Chart of Accounts preset found for country={country_code}, industry={industry_code}, using default")
        return self._get_default_chart_of_accounts()
    
    def _provision_tax_rates(self, tenant: Tenant, country_code: str, user=None) -> tuple[bool, int]:
        """Provision Tax Rates preset and create actual TaxRate records"""
        try:
            from presets.preset_loader_service import PresetLoaderService
            from invoicing.models import TaxRate
            
            # Check if tax rates already exist
            existing_count = TaxRate.objects.filter(tenant=tenant).count()
            if existing_count > 0:
                # Tax rates already exist, just update preset metadata
                preset_data = self._get_tax_rates_data(country_code)
                TenantPreset.objects.update_or_create(
                    tenant=tenant,
                    preset_type='tax_rates',
                    defaults={
                        'payload': preset_data,
                        'source_country': country_code,
                        'is_active': True,
                    }
                )
                return True, existing_count
            
            # Use PresetLoaderService for sequenced loading
            loader_service = PresetLoaderService(tenant=tenant, user=user)
            
            # Load tax data (tax categories + tax codes)
            tax_categories_count, tax_codes_count = loader_service._load_tax_data(
                country_code=country_code
            )
            
            record_count = tax_codes_count  # Tax codes create TaxRate records
            
            # Also save preset metadata
            preset_data = self._get_tax_rates_data(country_code)
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='tax_rates',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'is_active': True,
                }
            )
            
            return True, record_count
        except Exception as e:
            logger.error(f"Failed to provision tax rates: {e}")
            return False, 0
    
    def _get_tax_rates_data(self, country_code: str) -> dict:
        """Get tax rates JSON data with Malaysia-specific SST logic"""
        preset_path = os.path.join(
            self.presets_base_path,
            f"tax_rates/{country_code}.json"
        )
        
        if os.path.exists(preset_path):
            with open(preset_path, 'r') as f:
                data = json.load(f)
                # Malaysia-specific: Ensure SST rules are present
                if country_code == 'MY':
                    data = self._inject_malaysia_sst_rules(data)
                return data
        
        # Default to GST/Standard rules for non-Malaysia countries
        if country_code != 'MY':
            return self._get_default_gst_rules()
        
        return {
            'tax_rates': [],
            'tax_model': 'none',
            'supports_tax': False,
        }
    
    def _inject_malaysia_sst_rules(self, data: dict) -> dict:
        """Inject Malaysia SST rules if not already present"""
        if 'tax_rates' not in data:
            data['tax_rates'] = []
        
        # Check if SST rules already exist
        existing_codes = [rate.get('code', '') for rate in data['tax_rates']]
        
        # Add SST Sales Tax if missing
        if 'SST_SALES' not in existing_codes:
            data['tax_rates'].append({
                'name': 'SST Sales Tax',
                'code': 'SST_SALES',
                'rate': 10.00,
                'tax_type': 'sales',
                'region': 'Malaysia',
                'category': 'Goods',
                'is_default': True,
                'is_active': True,
                'description': 'Sales Tax on taxable goods (10% or 5% depending on category)',
                'effective_from': '2018-09-01'
            })
        
        # Add SST Service Tax if missing
        if 'SST_SERVICE' not in existing_codes:
            data['tax_rates'].append({
                'name': 'SST Service Tax',
                'code': 'SST_SERVICE',
                'rate': 6.00,
                'tax_type': 'service',
                'region': 'Malaysia',
                'category': 'Services',
                'is_default': False,
                'is_active': True,
                'description': 'Service Tax on taxable services',
                'effective_from': '2018-09-01'
            })
        
        # Add SST Exempt if missing
        if 'SST_EXEMPT' not in existing_codes:
            data['tax_rates'].append({
                'name': 'SST Exempt',
                'code': 'SST_EXEMPT',
                'rate': 0.00,
                'tax_type': 'sales',
                'region': 'Malaysia',
                'category': 'Exempt',
                'is_default': False,
                'is_active': True,
                'description': 'Exempt from SST',
                'effective_from': '2018-09-01'
            })
        
        data['tax_model'] = 'sst'
        data['supports_tax'] = True
        return data
    
    def _get_default_gst_rules(self) -> dict:
        """Get default GST/Standard tax rules for non-Malaysia countries"""
        return {
            'tax_rates': [
                {
                    'name': 'GST Standard Rate',
                    'code': 'GST_STANDARD',
                    'rate': 7.00,  # Default GST rate
                    'tax_type': 'gst',
                    'region': '',
                    'category': '',
                    'is_default': True,
                    'is_active': True,
                    'description': 'Standard GST rate',
                    'effective_from': None
                },
                {
                    'name': 'GST Zero Rate',
                    'code': 'GST_ZERO',
                    'rate': 0.00,
                    'tax_type': 'gst',
                    'region': '',
                    'category': 'Export',
                    'is_default': False,
                    'is_active': True,
                    'description': 'Zero-rated supplies',
                    'effective_from': None
                },
                {
                    'name': 'GST Exempt',
                    'code': 'GST_EXEMPT',
                    'rate': 0.00,
                    'tax_type': 'gst',
                    'region': '',
                    'category': 'Exempt',
                    'is_default': False,
                    'is_active': True,
                    'description': 'Exempt supplies',
                    'effective_from': None
                }
            ],
            'tax_model': 'gst',
            'supports_tax': True,
        }
    
    def _ensure_malaysian_coa_structure(self, data: dict) -> dict:
        """Ensure Malaysian Chart of Accounts structure is present"""
        if 'accounts' not in data:
            data['accounts'] = []
        
        # Check for key Malaysian account codes
        existing_codes = [acc.get('code', '') for acc in data['accounts']]
        
        # Add Malaysian-specific accounts if missing
        malaysian_accounts = [
            {'code': '1000', 'name': 'Assets', 'type': 'asset', 'normal_balance': 'debit'},
            {'code': '2000', 'name': 'Liabilities', 'type': 'liability', 'normal_balance': 'credit'},
            {'code': '3000', 'name': 'Equity', 'type': 'equity', 'normal_balance': 'credit'},
            {'code': '4000', 'name': 'Revenue', 'type': 'revenue', 'normal_balance': 'credit'},
            {'code': '5000', 'name': 'Expenses', 'type': 'expense', 'normal_balance': 'debit'},
        ]
        
        for account in malaysian_accounts:
            if account['code'] not in existing_codes:
                data['accounts'].append(account)
        
        return data
    
    def _provision_tax_categories(self, tenant: Tenant, country_code: str, user=None) -> tuple[bool, int]:
        """Provision Tax Categories"""
        try:
            from invoicing.models import TaxCategory
            
            # Check if tax categories already exist
            existing_count = TaxCategory.objects.filter(tenant=tenant).count()
            if existing_count > 0:
                return True, existing_count
            
            # Create default tax categories based on country
            default_categories = {
                'MY': ['GST', 'SST', 'Service Tax'],
                'SG': ['GST', 'Withholding Tax'],
                'TH': ['VAT', 'Withholding Tax'],
                'ID': ['VAT', 'PPN'],
                'PH': ['VAT', 'Withholding Tax'],
            }
            
            categories = default_categories.get(country_code, ['Sales Tax', 'VAT'])
            record_count = 0
            
            for category_name in categories:
                TaxCategory.objects.get_or_create(
                    tenant=tenant,
                    code=category_name.upper().replace(' ', '_'),
                    defaults={
                        'name': category_name,
                        'is_active': True,
                    }
                )
                record_count += 1
            
            return True, record_count
        except Exception as e:
            logger.error(f"Failed to provision tax categories: {e}")
            return False, 0
    
    def _provision_currency(self, tenant: Tenant, country_code: str) -> tuple[bool, int]:
        """Provision Currency preset and create Currency model records"""
        try:
            from presets.preset_loader_service import PresetLoaderService
            from fx_conversion.models import CurrencyConfig, ExchangeRate
            from django.utils import timezone
            from decimal import Decimal
            
            # Use PresetLoaderService for sequenced loading
            loader_service = PresetLoaderService(tenant=tenant, user=None)
            
            # Load currencies
            currencies_count = loader_service._load_currencies(country_code=country_code)
            
            # Get base currency code
            from fx_conversion.models import Currency
            base_currency = Currency.objects.filter(
                tenant=tenant,
                is_base_currency=True
            ).first()
            
            if not base_currency:
                # Fallback to country mapping
                currency_map = {
                    'SG': 'SGD', 'MY': 'MYR', 'TH': 'THB', 'ID': 'IDR',
                    'PH': 'PHP', 'VN': 'VND', 'MM': 'MMK', 'KH': 'KHR',
                    'LA': 'LAK', 'BN': 'BND', 'US': 'USD', 'GB': 'GBP',
                    'AU': 'AUD', 'CA': 'CAD', 'JP': 'JPY', 'CN': 'CNY',
                }
                currency_code = currency_map.get(country_code, 'USD')
            else:
                currency_code = base_currency.code
            
            record_count = currencies_count
            
            # Create common exchange rates (USD as reference for multi-currency transactions)
            if currency_code != 'USD':
                # Create USD exchange rate for Namecheap-like transactions
                usd_rate, _ = ExchangeRate.objects.get_or_create(
                    tenant=tenant,
                    from_currency='USD',
                    to_currency=currency_code,
                    valid_from=timezone.now(),
                    defaults={
                        'rate': Decimal('1.0'),  # Default rate, should be updated via API
                        'source': 'manual',
                        'provider': 'exchangerate-api',
                        'is_active': True,
                    }
                )
                record_count += 1
            
            preset_data = {
                'base_currency': currency_code,
                'supported_currencies': [currency_code],
                'exchange_rates': {},
            }
            
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='currency',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'is_active': True,
                }
            )
            
            # Update tenant currency
            tenant.currency_code = currency_code
            tenant.save(update_fields=['currency_code'])
            
            # Create currency config if needed
            CurrencyConfig.objects.get_or_create(
                tenant=tenant,
                defaults={
                    'base_currency': currency_code,
                    'default_exchange_rate_provider': 'exchangerate-api',
                    'auto_update_rates': True,
                    'update_frequency_hours': 24,
                }
            )
            
            return True, record_count
        except Exception as e:
            logger.error(f"Failed to provision currency: {e}")
            return False, 0
    
    def _provision_invoice_numbering(self, tenant: Tenant, country_code: str) -> tuple[bool, int]:
        """Provision Invoice Numbering preset"""
        try:
            # Country-specific invoice numbering rules
            numbering_rules = {
                'MY': {
                    'format': 'INV-{YYYY}-{MM}-{####}',
                    'prefix': 'INV',
                    'start_number': 1,
                },
                'SG': {
                    'format': 'INV-{YYYY}-{####}',
                    'prefix': 'INV',
                    'start_number': 1,
                },
                'TH': {
                    'format': 'INV-{YYYYMM}-{####}',
                    'prefix': 'INV',
                    'start_number': 1,
                },
            }
            
            preset_data = numbering_rules.get(
                country_code,
                {
                    'format': 'INV-{YYYY}-{####}',
                    'prefix': 'INV',
                    'start_number': 1,
                }
            )
            
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='invoice_numbering',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'is_active': True,
                }
            )
            
            return True, 1  # 1 numbering rule configured
        except Exception as e:
            logger.error(f"Failed to provision invoice numbering: {e}")
            return False, 0
    
    def _provision_einvoice_config(self, tenant: Tenant, country_code: str) -> tuple[bool, int]:
        """Provision E-Invoice Configuration preset"""
        try:
            # Country-specific e-invoice configurations
            einvoice_configs = {
                'MY': {
                    'provider': 'LHDN',
                    'api_endpoint': 'https://einvoice.hasil.gov.my/api',
                    'supports_einvoice': True,
                    'required_fields': ['tax_id', 'invoice_number'],
                },
                'SG': {
                    'provider': 'IRAS',
                    'api_endpoint': 'https://www.iras.gov.sg/api',
                    'supports_einvoice': True,
                    'required_fields': ['gst_number', 'invoice_number'],
                },
            }
            
            preset_data = einvoice_configs.get(
                country_code,
                {
                    'provider': None,
                    'api_endpoint': None,
                    'supports_einvoice': False,
                    'required_fields': [],
                }
            )
            
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='einvoice_config',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'is_active': True,
                }
            )
            
            return True, 1 if preset_data.get('supports_einvoice') else 0
        except Exception as e:
            logger.error(f"Failed to provision e-invoice config: {e}")
            return False, 0
    
    def _provision_country_settings(self, tenant: Tenant, country_code: str) -> tuple[bool, int]:
        """Provision Country Settings preset"""
        try:
            preset_path = os.path.join(
                self.presets_base_path,
                f"country_settings/{country_code}.json"
            )
            
            if os.path.exists(preset_path):
                with open(preset_path, 'r') as f:
                    preset_data = json.load(f)
            else:
                # Use default country settings
                preset_data = {
                    'country': country_code,
                    'timezone': 'UTC',
                    'date_format': 'YYYY-MM-DD',
                    'number_format': 'en-US',
                }
            
            TenantPreset.objects.update_or_create(
                tenant=tenant,
                preset_type='country_settings',
                defaults={
                    'payload': preset_data,
                    'source_country': country_code,
                    'is_active': True,
                }
            )
            
            # Apply country settings using loader
            from presets.loader import load_country_settings
            settings_applied = load_country_settings(tenant, country_code)
            record_count = len(settings_applied) if isinstance(settings_applied, dict) else (1 if settings_applied else 0)
            
            return True, record_count
        except Exception as e:
            logger.error(f"Failed to provision country settings: {e}")
            return False, 0
    
    def _update_tenant_flags(self, tenant: Tenant, country_code: str):
        """Update tenant system flags based on country"""
        # Check if country supports tax
        tax_supporting_countries = ['MY', 'SG', 'TH', 'ID', 'PH', 'VN']
        tenant.supports_tax = country_code in tax_supporting_countries
        
        # Check if country supports e-invoice
        einvoice_supporting_countries = ['MY', 'SG']
        tenant.supports_einvoice = country_code in einvoice_supporting_countries
        
        # Inventory and multi-branch are industry-dependent
        # Can be set based on industry_code if needed
        
        tenant.save(update_fields=[
            'supports_tax',
            'supports_einvoice',
        ])
    
    def _get_default_chart_of_accounts(self) -> dict:
        """Get default chart of accounts"""
        return {
            'accounts': [
                {
                    'code': '1000',
                    'name': 'Assets',
                    'type': 'asset',
                    'parent': None,
                },
                {
                    'code': '2000',
                    'name': 'Liabilities',
                    'type': 'liability',
                    'parent': None,
                },
                {
                    'code': '3000',
                    'name': 'Equity',
                    'type': 'equity',
                    'parent': None,
                },
                {
                    'code': '4000',
                    'name': 'Revenue',
                    'type': 'revenue',
                    'parent': None,
                },
                {
                    'code': '5000',
                    'name': 'Expenses',
                    'type': 'expense',
                    'parent': None,
                },
            ]
        }

