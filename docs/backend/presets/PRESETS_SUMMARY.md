# Country Presets Summary

## Overview

This document lists all available country presets for automatic tenant configuration.

## Presets Required

When a tenant registers and selects a country, the following presets are automatically loaded:

1. **Chart of Accounts** - Standard account structure based on local accounting standards
2. **Tax Rates** - GST/SST/VAT rates and configurations
3. **Currency Settings** - Default currency and exchange rate configuration
4. **Country Settings** - Fiscal year, timezone, date formats, etc.

## Currently Available Presets

### Southeast Asia (SEA)

| Country | Code | Chart of Accounts | Tax Rates | Currency | Settings |
|---------|------|-------------------|-----------|----------|----------|
| Singapore | SG | ✅ | ✅ (GST 9%) | SGD | ✅ |
| Malaysia | MY | ✅ | ✅ (SST 6-10%) | MYR | ✅ |
| Thailand | TH | ⚠️ | ✅ (VAT 7%) | THB | ⚠️ |
| Indonesia | ID | ⚠️ | ⚠️ | IDR | ⚠️ |
| Philippines | PH | ⚠️ | ⚠️ | PHP | ⚠️ |
| Vietnam | VN | ⚠️ | ⚠️ | VND | ⚠️ |
| Myanmar | MM | ⚠️ | ⚠️ | MMK | ⚠️ |
| Cambodia | KH | ⚠️ | ⚠️ | KHR | ⚠️ |
| Laos | LA | ⚠️ | ⚠️ | LAK | ⚠️ |
| Brunei | BN | ⚠️ | ⚠️ | BND | ⚠️ |

✅ = Complete  
⚠️ = Needs to be created

### Major Markets

| Country | Code | Chart of Accounts | Tax Rates | Currency | Settings |
|---------|------|-------------------|-----------|----------|----------|
| United States | US | ⚠️ | ✅ (Sales Tax) | USD | ✅ |
| United Kingdom | GB | ⚠️ | ⚠️ (VAT 20%) | GBP | ⚠️ |
| Australia | AU | ⚠️ | ⚠️ (GST 10%) | AUD | ⚠️ |
| Canada | CA | ⚠️ | ⚠️ (GST/HST) | CAD | ⚠️ |
| India | IN | ⚠️ | ⚠️ (GST) | INR | ⚠️ |
| China | CN | ⚠️ | ⚠️ (VAT) | CNY | ⚠️ |
| Japan | JP | ⚠️ | ⚠️ (Consumption Tax) | JPY | ⚠️ |

## Preset File Structure

```
presets/
├── README.md
├── PRESETS_INDEX.json          # Index of all available presets
├── IMPLEMENTATION_GUIDE.md     # How to use the presets
├── PRESETS_SUMMARY.md          # This file
├── loader.py                   # Python utility to load presets
├── chart_of_accounts/
│   ├── SG.json                 # Singapore
│   ├── MY.json                 # Malaysia
│   └── [country_code].json     # Other countries
├── tax_rates/
│   ├── SG.json                 # Singapore GST
│   ├── MY.json                 # Malaysia SST
│   ├── TH.json                 # Thailand VAT
│   ├── US.json                 # US Sales Tax
│   └── [country_code].json     # Other countries
├── currencies/
│   ├── SEA.json                # All SEA currencies
│   └── [region].json           # Regional currency groups
└── country_settings/
    ├── SG.json                 # Singapore settings
    ├── MY.json                 # Malaysia settings
    ├── US.json                 # US settings
    └── [country_code].json      # Other countries
```

## Chart of Accounts Structure

Each Chart of Accounts preset includes:
- **Account Code** - Unique identifier (e.g., "1000", "1100")
- **Account Name** - Display name
- **Account Type** - asset, liability, equity, revenue, expense
- **Normal Balance** - debit or credit
- **Parent Account** - For hierarchical structure
- **Description** - Account purpose
- **System Account** - Cannot be deleted if true

### Standard Account Categories

1. **Assets (1000-1999)**
   - Current Assets (1100-1199)
   - Non-Current Assets (1200-1999)

2. **Liabilities (2000-2999)**
   - Current Liabilities (2100-2199)
   - Non-Current Liabilities (2200-2999)

3. **Equity (3000-3999)**
   - Share Capital (3100-3199)
   - Retained Earnings (3200-3299)
   - Current Year Earnings (3300-3399)

4. **Revenue (4000-4999)**
   - Sales Revenue (4100-4199)
   - Service Revenue (4200-4299)
   - Other Income (4300-4999)

5. **Expenses (5000-5999)**
   - Cost of Goods Sold (5100-5199)
   - Operating Expenses (5200-5999)

## Tax Rate Structure

Each Tax Rate preset includes:
- **Name** - Display name (e.g., "GST Standard Rate")
- **Code** - Unique code (e.g., "GST_STANDARD")
- **Rate** - Percentage (e.g., 9.00)
- **Tax Type** - gst, sst, vat, sales, service
- **Region** - Country/State/Province
- **Category** - Product/service category (optional)
- **Is Default** - Default rate for the country
- **Effective Dates** - When the rate is valid

### Common Tax Types

- **GST** - Goods and Services Tax (Singapore, Australia, India)
- **SST** - Sales and Service Tax (Malaysia)
- **VAT** - Value Added Tax (Thailand, Indonesia, Philippines, Vietnam, etc.)
- **Sales Tax** - State-based sales tax (United States)
- **Consumption Tax** - Japan

## Currency Presets

Currency presets include:
- **Currency Code** - ISO 4217 code (e.g., "SGD")
- **Currency Name** - Full name (e.g., "Singapore Dollar")
- **Symbol** - Display symbol (e.g., "S$")
- **Country** - Associated country
- **Decimal Places** - Number of decimal places (0 or 2)
- **Exchange Rate Settings** - Provider and update frequency

## Country Settings

Country settings include:
- **Currency** - Default currency
- **Fiscal Year** - Start and end dates
- **Timezone** - IANA timezone (e.g., "Asia/Singapore")
- **Date Format** - Date display format
- **Number Format** - Decimal and thousands separators
- **Tax System** - GST/SST/VAT information
- **Accounting Standards** - Local accounting framework
- **Features** - Enabled features (GST, multi-currency, etc.)

## Next Steps

### Priority 1: Complete SEA Countries
1. Create Chart of Accounts for remaining SEA countries
2. Create Tax Rates for remaining SEA countries
3. Create Country Settings for remaining SEA countries

### Priority 2: Major Markets
1. Create presets for UK, Australia, Canada
2. Create presets for India, China, Japan

### Priority 3: Additional Countries
1. Add more countries based on user demand
2. Create regional currency groups
3. Add state/province-specific tax rates

## Usage Example

```python
from presets.loader import load_all_presets

# During tenant registration
result = load_all_presets(
    tenant=new_tenant,
    country_code="SG",  # User selected Singapore
    user=request.user
)

# Result:
# {
#   'chart_of_accounts': 25,  # 25 accounts created
#   'tax_rates': 3,           # 3 tax rates created
#   'settings_applied': True  # Settings applied
# }
```

## Maintenance

- **Update tax rates** when regulations change
- **Add new accounts** when accounting standards update
- **Review presets** quarterly for accuracy
- **Test preset loading** after any changes

