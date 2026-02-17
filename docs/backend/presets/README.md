# Country Presets for Tenant Setup

This directory contains JSON preset files for automatic tenant configuration based on country selection during registration.

## Structure

- `chart_of_accounts/` - Standard Chart of Accounts templates by country
- `tax_rates/` - Tax rate configurations (GST/SST/VAT) by country
- `currencies/` - Currency presets with default settings
- `country_settings/` - Country-specific settings (fiscal year, timezone, etc.)

## Usage

When a tenant registers and selects a country, the system will:
1. Load the appropriate Chart of Accounts preset
2. Configure tax rates (GST/SST/VAT) based on country
3. Set default currency and exchange rate settings
4. Apply country-specific settings (fiscal year, timezone, etc.)

## Supported Countries

### Southeast Asia (SEA)
- Singapore (SGD, GST)
- Malaysia (MYR, SST)
- Thailand (THB, VAT)
- Indonesia (IDR, VAT)
- Philippines (PHP, VAT)
- Vietnam (VND, VAT)
- Myanmar (MMK, Commercial Tax)
- Cambodia (KHR, VAT)
- Laos (LAK, VAT)
- Brunei (BND, No GST)

### Major Markets
- United States (USD, Sales Tax)
- United Kingdom (GBP, VAT)
- Canada (CAD, GST/HST)
- Australia (AUD, GST)
- India (INR, GST)
- China (CNY, VAT)
- Japan (JPY, Consumption Tax)

## File Naming Convention

Files are named using ISO 3166-1 alpha-2 country codes:
- `SG.json` - Singapore
- `MY.json` - Malaysia
- `US.json` - United States
- etc.

