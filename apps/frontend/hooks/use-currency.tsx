"use client"

import { useState, useEffect } from "react"

export interface Currency {
  code: string
  symbol: string
  name: string
  decimal: number
}

export const currencies: Record<string, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimal: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimal: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimal: 2 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", decimal: 0 },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimal: 2 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimal: 2 },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", decimal: 2 },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", decimal: 2 },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", decimal: 0 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", decimal: 2 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", decimal: 2 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimal: 2 },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc", decimal: 2 },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", decimal: 0 },
  PHP: { code: "PHP", symbol: "₱", name: "Philippine Peso", decimal: 2 },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong", decimal: 0 },
}

const countryToCurrency: Record<string, string> = {
  US: "USD", CA: "CAD", GB: "GBP", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  JP: "JPY", CN: "CNY", SG: "SGD", MY: "MYR", TH: "THB", ID: "IDR", IN: "INR",
  AU: "AUD", CH: "CHF", KR: "KRW", PH: "PHP", VN: "VND", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", MT: "EUR",
  CY: "EUR", SI: "EUR", SK: "EUR", EE: "EUR", LV: "EUR", LT: "EUR"
}

interface GeolocationData {
  country: string
  currency: string
  timezone: string
  region: string
}

export function useCurrency() {
  const [defaultCurrency, setDefaultCurrency] = useState<string>("USD")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD")
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detect geolocation and set currency
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try multiple geolocation APIs for better reliability
        const geoData = await detectGeolocation()
        
        if (geoData) {
          setGeolocation(geoData)
          setDefaultCurrency(geoData.currency)
          setSelectedCurrency(geoData.currency)
        } else {
          // Fallback to browser timezone detection
          const timezoneCurrency = getCurrencyFromTimezone()
          setDefaultCurrency(timezoneCurrency)
          setSelectedCurrency(timezoneCurrency)
        }
      } catch (err) {
        console.warn("Currency detection failed:", err)
        setError("Could not detect location")
        // Keep USD as fallback
        setDefaultCurrency("USD")
        setSelectedCurrency("USD")
      } finally {
        setIsLoading(false)
      }
    }

    detectCurrency()
  }, [])

  const detectGeolocation = async (): Promise<GeolocationData | null> => {
    try {
      // Method 1: ipapi.co (free, reliable)
      const response = await fetch("https://ipapi.co/json/", {
        timeout: 5000
      } as any)
      
      if (response.ok) {
        const data = await response.json()
        const currencyCode = countryToCurrency[data.country_code] || "USD"
        
        return {
          country: data.country_name,
          currency: currencyCode,
          timezone: data.timezone,
          region: data.region
        }
      }
    } catch (error) {
      console.warn("Primary geolocation API failed:", error)
    }

    try {
      // Method 2: ipgeolocation.io (backup)
      const response = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=free", {
        timeout: 5000
      } as any)
      
      if (response.ok) {
        const data = await response.json()
        const currencyCode = countryToCurrency[data.country_code2] || "USD"
        
        return {
          country: data.country_name,
          currency: currencyCode,
          timezone: data.time_zone.name,
          region: data.state_prov
        }
      }
    } catch (error) {
      console.warn("Backup geolocation API failed:", error)
    }

    return null
  }

  const getCurrencyFromTimezone = (): string => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      // Map common timezones to currencies
      const timezoneMap: Record<string, string> = {
        "Asia/Kuala_Lumpur": "MYR",
        "Asia/Singapore": "SGD",
        "Asia/Bangkok": "THB",
        "Asia/Jakarta": "IDR",
        "Asia/Manila": "PHP",
        "Asia/Ho_Chi_Minh": "VND",
        "Asia/Tokyo": "JPY",
        "Asia/Shanghai": "CNY",
        "Asia/Seoul": "KRW",
        "Asia/Kolkata": "INR",
        "Europe/London": "GBP",
        "Europe/Paris": "EUR",
        "Europe/Berlin": "EUR",
        "Europe/Rome": "EUR",
        "Europe/Madrid": "EUR",
        "America/New_York": "USD",
        "America/Los_Angeles": "USD",
        "America/Chicago": "USD",
        "America/Toronto": "CAD",
        "Australia/Sydney": "AUD",
        "Pacific/Auckland": "NZD"
      }

      return timezoneMap[timezone] || "USD"
    } catch {
      return "USD"
    }
  }

  const formatAmount = (
    amount: number, 
    currencyCode?: string, 
    options?: { 
      showSymbol?: boolean
      showCode?: boolean
      compact?: boolean
    }
  ): string => {
    const currency = currencies[currencyCode || selectedCurrency]
    if (!currency) return amount.toString()

    const { showSymbol = true, showCode = false, compact = false } = options || {}

    let formatted: string

    if (compact && amount >= 1000) {
      // Compact notation for large amounts
      const compactFormatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
      })
      formatted = compactFormatter.format(amount)
    } else {
      // Standard formatting
      formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: currency.decimal,
        maximumFractionDigits: currency.decimal
      }).format(amount)
    }

    if (showSymbol && showCode) {
      return `${currency.symbol}${formatted} ${currency.code}`
    } else if (showSymbol) {
      return `${currency.symbol}${formatted}`
    } else if (showCode) {
      return `${formatted} ${currency.code}`
    } else {
      return formatted
    }
  }

  const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    // In a real app, you'd use live exchange rates
    // For now, return the same amount (assuming 1:1 conversion)
    // You can integrate with APIs like exchangerate-api.com
    if (fromCurrency === toCurrency) return amount
    
    // Placeholder conversion rates (in real app, fetch from API)
    const mockRates: Record<string, Record<string, number>> = {
      USD: { MYR: 4.65, SGD: 1.35, EUR: 0.85, GBP: 0.73 },
      MYR: { USD: 0.22, SGD: 0.29, EUR: 0.18, GBP: 0.16 },
      SGD: { USD: 0.74, MYR: 3.44, EUR: 0.63, GBP: 0.54 },
    }

    const rate = mockRates[fromCurrency]?.[toCurrency] || 1
    return amount * rate
  }

  const getCurrencyList = () => {
    return Object.values(currencies)
  }

  const getCurrency = (code: string) => {
    return currencies[code] || currencies.USD
  }

  return {
    // State
    defaultCurrency,
    selectedCurrency,
    geolocation,
    isLoading,
    error,
    
    // Actions
    setSelectedCurrency,
    
    // Utilities
    formatAmount,
    convertAmount,
    getCurrencyList,
    getCurrency,
    
    // Current currency info
    currentCurrency: getCurrency(selectedCurrency)
  }
} 