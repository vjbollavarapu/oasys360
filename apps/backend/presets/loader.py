"""
Preset Loader Utility
Loads country-specific presets (Chart of Accounts, Tax Rates, Currency, Settings) when a tenant registers
"""
import json
import os
from pathlib import Path
from django.db import transaction
from decimal import Decimal
from datetime import date

# Get the presets directory path
PRESETS_DIR = Path(__file__).parent


def load_json_file(file_path):
    """Load JSON file from presets directory"""
    full_path = PRESETS_DIR / file_path
    if not full_path.exists():
        return None
    with open(full_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_chart_of_accounts(tenant, country_code, user=None):
    """
    Load Chart of Accounts preset for a country
    
    Args:
        tenant: Tenant instance
        country_code: ISO 3166-1 alpha-2 country code (e.g., 'SG', 'MY')
        user: User instance (for created_by field)
    
    Returns:
        List of created ChartOfAccounts instances
    """
    from accounting.models import ChartOfAccounts, GLAccountType
    
    file_path = f"chart_of_accounts/{country_code}.json"
    data = load_json_file(file_path)
    
    if not data:
        return []
    
    # First, ensure GLAccountType records exist for this tenant
    account_types = {
        'asset': {'name': 'Asset', 'normal_balance': 'debit', 'display_order': 1},
        'liability': {'name': 'Liability', 'normal_balance': 'credit', 'display_order': 2},
        'equity': {'name': 'Equity', 'normal_balance': 'credit', 'display_order': 3},
        'revenue': {'name': 'Revenue', 'normal_balance': 'credit', 'display_order': 4},
        'expense': {'name': 'Expense', 'normal_balance': 'debit', 'display_order': 5},
    }
    
    type_map = {}  # Map type code to GLAccountType instance
    for type_code, type_info in account_types.items():
        account_type, _ = GLAccountType.objects.get_or_create(
            tenant=tenant,
            code=type_code,
            defaults={
                'name': type_info['name'],
                'normal_balance': type_info['normal_balance'],
                'display_order': type_info['display_order'],
                'is_system': True,
                'is_active': True,
            }
        )
        type_map[type_code] = account_type
    
    accounts_created = []
    account_map = {}  # Map code to account instance for parent relationships
    
    def create_account(account_data, parent=None):
        """Recursively create account and children"""
        account_type_code = account_data.get('type')
        account_type_obj = type_map.get(account_type_code) if account_type_code else None
        
        account = ChartOfAccounts.objects.create(
            tenant=tenant,
            code=account_data['code'],
            name=account_data['name'],
            type=account_data['type'],  # Keep legacy field
            account_type=account_type_obj,  # Set FK if available
            parent=parent,
            description=account_data.get('description', ''),
            is_active=account_data.get('is_active', True),
            is_system=account_data.get('is_system', False),
            normal_balance=account_data['normal_balance'],
            created_by=user,
        )
        account_map[account_data['code']] = account
        accounts_created.append(account)
        
        # Create children accounts
        for child_data in account_data.get('children', []):
            create_account(child_data, parent=account)
        
        return account
    
    with transaction.atomic():
        for account_data in data.get('accounts', []):
            create_account(account_data)
    
    return accounts_created


def load_tax_rates(tenant, country_code, user=None):
    """
    Load Tax Rates preset for a country
    
    Args:
        tenant: Tenant instance
        country_code: ISO 3166-1 alpha-2 country code
        user: User instance (for created_by field)
    
    Returns:
        List of created TaxRate instances
    """
    from invoicing.models import TaxRate, TaxCode
    
    file_path = f"tax_rates/{country_code}.json"
    data = load_json_file(file_path)
    
    if not data:
        return []
    
    tax_rates_created = []
    tax_code_map = {}  # Map tax code string to TaxCode instance
    
    with transaction.atomic():
        # First, create TaxCode records for all tax codes in the JSON
        for rate_data in data.get('tax_rates', []):
            tax_code_str = rate_data.get('code')
            if tax_code_str and tax_code_str not in tax_code_map:
                tax_code, _ = TaxCode.objects.get_or_create(
                    tenant=tenant,
                    code=tax_code_str,
                    defaults={
                        'name': rate_data.get('name', tax_code_str),
                        'tax_type': rate_data.get('tax_type', 'custom'),
                        'description': rate_data.get('description', ''),
                        'is_system': True,
                        'is_active': True,
                    }
                )
                tax_code_map[tax_code_str] = tax_code
        
        # Then create TaxRate records linked to TaxCode
        for rate_data in data.get('tax_rates', []):
            effective_from = None
            if rate_data.get('effective_from'):
                effective_from = date.fromisoformat(rate_data['effective_from'])
            
            tax_code_str = rate_data.get('code')
            tax_code_obj = tax_code_map.get(tax_code_str) if tax_code_str else None
            
            tax_rate = TaxRate.objects.create(
                tenant=tenant,
                name=rate_data['name'],
                code=rate_data['code'],  # Keep legacy field
                tax_code=tax_code_obj,  # Set FK if available
                rate=Decimal(str(rate_data['rate'])),
                tax_type=rate_data['tax_type'],
                region=rate_data.get('region', ''),
                category=rate_data.get('category', ''),
                is_default=rate_data.get('is_default', False),
                is_active=rate_data.get('is_active', True),
                effective_from=effective_from,
                effective_to=None,  # Can be set if provided
                description=rate_data.get('description', ''),
                created_by=user,
            )
            tax_rates_created.append(tax_rate)
    
    return tax_rates_created


def load_country_settings(tenant, country_code):
    """
    Load Country Settings preset
    
    Args:
        tenant: Tenant instance
        country_code: ISO 3166-1 alpha-2 country code
    
    Returns:
        Dictionary of settings applied
    """
    from tenants.models import Company
    from fx_conversion.models import CurrencyConfig
    
    file_path = f"country_settings/{country_code}.json"
    data = load_json_file(file_path)
    
    if not data:
        return {}
    
    settings_applied = {}
    
    with transaction.atomic():
        # Update primary company with country settings
        primary_company = Company.objects.filter(tenant=tenant, is_primary=True).first()
        if primary_company:
            currency_data = data.get('currency', {})
            if currency_data:
                primary_company.currency = currency_data.get('code', 'USD')
                primary_company.country = country_code
                primary_company.timezone = data.get('timezone', 'UTC')
                
                # Set fiscal year start if provided
                fiscal_year = data.get('fiscal_year', {})
                if fiscal_year:
                    from datetime import date
                    current_year = date.today().year
                    primary_company.fiscal_year_start = date(
                        current_year,
                        fiscal_year.get('start_month', 1),
                        fiscal_year.get('start_day', 1)
                    )
                
                primary_company.save()
                settings_applied['company'] = True
        
        # Create currency config
        currency_data = data.get('currency', {})
        if currency_data:
            CurrencyConfig.objects.get_or_create(
                tenant=tenant,
                defaults={
                    'base_currency': currency_data.get('code', 'USD'),
                    'default_exchange_rate_provider': 'exchangerate-api',
                    'auto_update_rates': True,
                    'update_frequency_hours': 24,
                }
            )
            settings_applied['currency_config'] = True
    
    return settings_applied


def load_all_presets(tenant, country_code, user=None):
    """
    Load all presets for a country (Chart of Accounts, Tax Rates, Settings)
    
    Args:
        tenant: Tenant instance
        country_code: ISO 3166-1 alpha-2 country code
        user: User instance (for created_by field)
    
    Returns:
        Dictionary with counts of created items
    """
    result = {
        'chart_of_accounts': 0,
        'tax_rates': 0,
        'settings_applied': False,
    }
    
    try:
        # Load Chart of Accounts
        accounts = load_chart_of_accounts(tenant, country_code, user)
        result['chart_of_accounts'] = len(accounts)
        
        # Load Tax Rates
        tax_rates = load_tax_rates(tenant, country_code, user)
        result['tax_rates'] = len(tax_rates)
        
        # Load Country Settings
        settings = load_country_settings(tenant, country_code)
        result['settings_applied'] = bool(settings)
        
    except Exception as e:
        result['error'] = str(e)
        raise
    
    return result


def get_available_countries():
    """
    Get list of available countries with presets
    
    Returns:
        List of country dictionaries
    """
    index_file = PRESETS_DIR / "PRESETS_INDEX.json"
    if not index_file.exists():
        return []
    
    data = load_json_file("PRESETS_INDEX.json")
    return data.get('countries', [])


def get_country_info(country_code):
    """
    Get information about a specific country's presets
    
    Args:
        country_code: ISO 3166-1 alpha-2 country code
    
    Returns:
        Dictionary with country information and available presets
    """
    countries = get_available_countries()
    for country in countries:
        if country['country_code'] == country_code.upper():
            return country
    return None

