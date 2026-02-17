# Presets Implementation Guide

## Overview

This guide explains how to use the country presets system to automatically configure tenants during registration.

## Preset Types

### 1. Chart of Accounts (`chart_of_accounts/`)
Standard account structures based on local accounting standards:
- **SG.json** - Singapore Financial Reporting Standards (SFRS)
- **MY.json** - Malaysian Financial Reporting Standards (MFRS)
- **US.json** - US Generally Accepted Accounting Principles (GAAP)
- **GB.json** - UK GAAP
- And more...

### 2. Tax Rates (`tax_rates/`)
Country-specific tax configurations:
- **GST** - Goods and Services Tax (Singapore, Australia, etc.)
- **SST** - Sales and Service Tax (Malaysia)
- **VAT** - Value Added Tax (Thailand, Indonesia, Philippines, etc.)
- **Sales Tax** - State-based sales tax (United States)

### 3. Currency Presets (`currencies/`)
Currency configurations with exchange rate settings:
- **SEA.json** - All Southeast Asian currencies
- **APAC.json** - Asia Pacific currencies
- **NA.json** - North American currencies
- **EU.json** - European currencies

### 4. Country Settings (`country_settings/`)
Country-specific configurations:
- Fiscal year settings
- Timezone
- Date and number formats
- Tax system information
- Accounting standards

## Usage

### During Tenant Registration

```python
from presets.loader import load_all_presets
from tenants.models import Tenant

# When creating a new tenant
tenant = Tenant.objects.create(
    name="My Company",
    # ... other fields
)

# Load presets based on country selection
result = load_all_presets(
    tenant=tenant,
    country_code="SG",  # Singapore
    user=request.user  # The user creating the tenant
)

print(f"Created {result['chart_of_accounts']} accounts")
print(f"Created {result['tax_rates']} tax rates")
print(f"Settings applied: {result['settings_applied']}")
```

### Loading Individual Presets

```python
from presets.loader import (
    load_chart_of_accounts,
    load_tax_rates,
    load_country_settings
)

# Load only Chart of Accounts
accounts = load_chart_of_accounts(tenant, "SG", user)

# Load only Tax Rates
tax_rates = load_tax_rates(tenant, "SG", user)

# Load only Country Settings
settings = load_country_settings(tenant, "SG")
```

### Getting Available Countries

```python
from presets.loader import get_available_countries, get_country_info

# Get all available countries
countries = get_available_countries()
for country in countries:
    print(f"{country['country_code']}: {country['country_name']}")

# Get specific country info
info = get_country_info("SG")
print(f"Currency: {info['currency']}")
print(f"Chart of Accounts: {info['chart_of_accounts']}")
```

## Integration with Registration Flow

### Option 1: Automatic Loading

Modify the registration serializer to automatically load presets:

```python
# In authentication/serializers.py
from presets.loader import load_all_presets

class RegisterSerializer(serializers.ModelSerializer):
    country_code = serializers.CharField(write_only=True, required=False)
    
    def create(self, validated_data):
        country_code = validated_data.pop('country_code', None)
        # ... create tenant and user ...
        
        if country_code:
            try:
                load_all_presets(tenant, country_code, user)
            except Exception as e:
                # Log error but don't fail registration
                logger.error(f"Failed to load presets: {e}")
        
        return user
```

### Option 2: Manual Selection

Provide a country selection step after registration:

```python
# In a view or API endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_country(request):
    country_code = request.data.get('country_code')
    tenant = request.user.tenant
    
    if not country_code:
        return Response({'error': 'country_code required'}, status=400)
    
    result = load_all_presets(tenant, country_code, request.user)
    
    return Response({
        'success': True,
        'message': f"Loaded presets for {country_code}",
        'result': result
    })
```

## Adding New Countries

1. **Create Chart of Accounts preset:**
   ```bash
   # Create apps/backend/presets/chart_of_accounts/XX.json
   # Follow the structure in SG.json or MY.json
   ```

2. **Create Tax Rates preset:**
   ```bash
   # Create apps/backend/presets/tax_rates/XX.json
   # Include all relevant tax rates for the country
   ```

3. **Create Country Settings preset:**
   ```bash
   # Create apps/backend/presets/country_settings/XX.json
   # Include fiscal year, timezone, formats, etc.
   ```

4. **Update PRESETS_INDEX.json:**
   ```json
   {
     "country_code": "XX",
     "country_name": "Country Name",
     "chart_of_accounts": "chart_of_accounts/XX.json",
     "tax_rates": "tax_rates/XX.json",
     "country_settings": "country_settings/XX.json",
     "currency": "XXX"
   }
   ```

## Best Practices

1. **Always use transactions** - Preset loading is wrapped in transactions to ensure data consistency
2. **Handle errors gracefully** - Don't fail registration if preset loading fails
3. **Allow customization** - Presets are starting points, users can modify them
4. **Keep presets updated** - Update tax rates and settings when regulations change
5. **Test thoroughly** - Test preset loading for each country before deployment

## Maintenance

### Updating Tax Rates

When tax rates change (e.g., GST increase in Singapore):
1. Update the relevant `tax_rates/XX.json` file
2. Set `effective_from` date for the new rate
3. Keep old rates with `effective_to` dates for historical accuracy

### Adding New Accounts

When accounting standards change:
1. Update the relevant `chart_of_accounts/XX.json` file
2. Ensure parent-child relationships are correct
3. Mark system accounts with `is_system: true`

## Troubleshooting

### Presets not loading
- Check that JSON files are valid
- Verify file paths in PRESETS_INDEX.json
- Check Django logs for errors

### Missing accounts
- Verify account codes are unique
- Check parent-child relationships
- Ensure all required fields are present

### Tax rates not applying
- Verify tax rate codes match invoice templates
- Check effective dates
- Ensure `is_active: true` for active rates

