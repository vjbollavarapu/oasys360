"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Loader2, AlertCircle, Building2, Globe, Briefcase, Settings, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OnboardingWizardProps {
  initialStatus?: any
  onComplete: () => void
}

const STEPS = [
  { number: 1, title: "Subscription", icon: Settings },
  { number: 2, title: "Domain", icon: Globe },
  { number: 3, title: "Company Profile", icon: Building2 },
  { number: 4, title: "Presets", icon: Briefcase },
  { number: 5, title: "Confirmation", icon: Check },
]

export function OnboardingWizard({ initialStatus, onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Subscription
  const [planCode, setPlanCode] = useState('trial')
  const [billingCycle, setBillingCycle] = useState('trial')
  
  // Step 2: Domain
  const [primaryDomain, setPrimaryDomain] = useState('')
  const [domainType, setDomainType] = useState('subdomain')
  
  // Step 3: Company Profile
  const [legalName, setLegalName] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [industryCode, setIndustryCode] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [taxId, setTaxId] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  
  // Step 4: Presets (auto-provisioned)
  const [presetsStatus, setPresetsStatus] = useState<any>(null)
  const [presetProgress, setPresetProgress] = useState<{
    currentPreset: string
    overallProgress: number
    currentStep: number
    totalSteps: number
    details: Record<string, { success: boolean; record_count: number; name: string }>
  } | null>(null)
  
  useEffect(() => {
    if (initialStatus) {
      setCurrentStep(initialStatus.current_step || 1)
      setCompletedSteps(initialStatus.completed_steps || [])
    }
    
    // Fetch tenant info to get domain
    const fetchTenantInfo = async () => {
      try {
        const result = await makeRequest('/api/v1/tenants/me/', 'GET')
        // If result is undefined, it means authentication failed and logout/redirect is already handled
        if (!result) {
          return // Logout/redirect already handled in makeRequest
        }
        if (result.primary_domain) {
          // Extract just the subdomain part if it's a full domain
          // e.g., "aqrsb.oasys360.com" -> "aqrsb" or "aqrsb" -> "aqrsb"
          const domain = result.primary_domain
          const subdomain = domain.includes('.') ? domain.split('.')[0] : domain
          setPrimaryDomain(subdomain)
        } else if (result.slug) {
          // Fallback to slug if primary_domain is not set
          setPrimaryDomain(result.slug)
        }
      } catch (err) {
        // If it's an authentication error, logout/redirect is already handled in makeRequest
        // Just silently return - the redirect will happen
        if (err instanceof Error && (err.message === 'AUTHENTICATION_FAILED' || err.name === 'AuthenticationError')) {
          return // Logout/redirect already handled
        }
        console.error('Failed to fetch tenant info:', err)
        // Silently fail - domain might not be set yet or user might not be authenticated
        // This is expected during onboarding when tenant info might not be available
      }
    }
    
    fetchTenantInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus])

  const getToken = () => {
    return localStorage.getItem('oasys_access_token')
  }

  const makeRequest = async (endpoint: string, method: string, data?: any) => {
    // Get API base URL (fixed for row-based multi-tenancy)
    const { getApiBaseUrl } = await import('@/lib/get-api-url')
    const API_BASE_URL = getApiBaseUrl()
    const token = getToken()
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.')
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        // Handle authentication errors FIRST - before trying to parse response
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token
          localStorage.removeItem('oasys_access_token')
          localStorage.removeItem('oasys_refresh_token')
          localStorage.removeItem('oasys_user_data')
          // Call logout to clear auth state and redirect
          logout().then(() => {
            router.push('/auth/login')
          }).catch(() => {
            router.push('/auth/login')
          })
          // Return undefined to stop execution - logout/redirect already handled
          return undefined
        }
        
        // For other errors, try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      // If this is our authentication error, don't show network error - logout/redirect is already handled
      if (error instanceof Error && (error.message === 'AUTHENTICATION_FAILED' || error.name === 'AuthenticationError')) {
        // Return undefined to stop execution - logout/redirect already handled
        return undefined
      }
      
      // Handle network errors (actual connection failures)
      // Only treat as network error if it's a TypeError from fetch and not an HTTP error
      // Network errors occur when fetch itself fails (no response received)
      if (error instanceof TypeError && 
          (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Network error: Unable to connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`)
      }
      
      // Re-throw other errors (including HTTP errors like 403, 401, etc.)
      throw error
    }
  }

  const handleStep1 = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await makeRequest('/api/v1/tenants/onboarding/step/1/', 'POST', {
        plan_code: planCode,
        billing_cycle: billingCycle,
      })
      
      setCompletedSteps([...completedSteps, 1])
      setCurrentStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2 = async () => {
    if (!primaryDomain) {
      setError('Domain is required')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await makeRequest('/api/v1/tenants/onboarding/step/2/', 'POST', {
        primary_domain: primaryDomain,
        domain_type: domainType,
      })
      
      setCompletedSteps([...completedSteps, 2])
      setCurrentStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save domain configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep3 = async () => {
    if (!legalName || !countryCode || !industryCode) {
      setError('Legal name, country, and industry are required')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await makeRequest('/api/v1/tenants/onboarding/step/3/', 'POST', {
        legal_name: legalName,
        country_code: countryCode,
        industry_code: industryCode,
        timezone,
        currency_code: currencyCode,
        tax_id: taxId,
        registration_number: registrationNumber,
        address,
        city,
        state,
        postal_code: postalCode,
        phone,
        email,
        website,
      })
      
      setCompletedSteps([...completedSteps, 3])
      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep4 = async () => {
    setIsLoading(true)
    setError(null)
    setPresetProgress({
      currentPreset: 'Starting...',
      overallProgress: 0,
      currentStep: 0,
      totalSteps: 7,
      details: {}
    })
    
    try {
      const result = await makeRequest('/api/v1/tenants/onboarding/step/4/', 'POST', {})
      
      // Update with final results
      if (result.detailed_results) {
        const details: Record<string, { success: boolean; record_count: number; name: string }> = {}
        Object.entries(result.detailed_results).forEach(([key, value]: [string, any]) => {
          details[key] = {
            success: value.success,
            record_count: value.record_count || 0,
            name: value.name || key
          }
        })
        
        setPresetProgress({
          currentPreset: 'Complete',
          overallProgress: 100,
          currentStep: result.total_presets || 7,
          totalSteps: result.total_presets || 7,
          details
        })
      }
      
      setPresetsStatus(result.presets || result.detailed_results)
      setCompletedSteps([...completedSteps, 4])
      setCurrentStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to provision presets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep5 = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await makeRequest('/api/v1/tenants/onboarding/step/5/', 'POST', {})
      
      setCompletedSteps([...completedSteps, 5])
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        handleStep1()
        break
      case 2:
        handleStep2()
        break
      case 3:
        handleStep3()
        break
      case 4:
        handleStep4()
        break
      case 5:
        handleStep5()
        break
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return planCode && billingCycle
      case 2:
        return primaryDomain.length > 0
      case 3:
        return legalName && countryCode && industryCode
      case 4:
        return true // Auto-provisioned
      case 5:
        return true // Confirmation
      default:
        return false
    }
  }

  const progress = (completedSteps.length / STEPS.length) * 100
  const currentStepData = STEPS[currentStep - 1]
  const CurrentStepIcon = currentStepData?.icon

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between">
              {STEPS.map((step) => {
                const Icon = step.icon
                const isCompleted = completedSteps.includes(step.number)
                const isCurrent = currentStep === step.number
                
                return (
                  <div key={step.number} className="flex flex-col items-center space-y-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs ${isCurrent ? 'font-semibold' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData && CurrentStepIcon && (
              <>
                <CurrentStepIcon className="w-5 h-5" />
                Step {currentStep}: {currentStepData.title}
              </>
            )}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Select your subscription plan and billing cycle"}
            {currentStep === 2 && "Configure your domain or subdomain"}
            {currentStep === 3 && "Enter your company information"}
            {currentStep === 4 && "Auto-provisioning presets based on your selections"}
            {currentStep === 5 && "Review and confirm your setup"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Subscription */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan *</Label>
                <Select value={planCode} onValueChange={setPlanCode}>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial (14 days)</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing">Billing Cycle *</Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger id="billing">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Domain */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {primaryDomain && (
                <Alert>
                  <AlertDescription>
                    Your domain was set during signup and cannot be changed. If you need a different domain, please contact support.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="domainType">Domain Type {primaryDomain ? '(Set during signup)' : '*'}</Label>
                <Select value={domainType} onValueChange={setDomainType} disabled={!!primaryDomain}>
                  <SelectTrigger id="domainType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subdomain">Platform Subdomain</SelectItem>
                    <SelectItem value="custom">Custom Domain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain {primaryDomain ? '(Set during signup)' : '*'}</Label>
                <Input
                  id="domain"
                  value={primaryDomain}
                  onChange={(e) => {
                    // Only allow changes if domain is not set
                    if (!primaryDomain) {
                      setPrimaryDomain(e.target.value)
                    }
                  }}
                  placeholder={domainType === 'subdomain' ? 'yourcompany' : 'yourcompany.com'}
                  disabled={isLoading || !!primaryDomain}
                  readOnly={!!primaryDomain}
                  className={primaryDomain ? 'bg-muted cursor-not-allowed' : ''}
                />
                {primaryDomain && (
                  <p className="text-xs text-muted-foreground">
                    Your domain: <strong>{primaryDomain}</strong>
                    {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                      ? `.localhost:3000`
                      : `.oasys360.com`}
                  </p>
                )}
                {!primaryDomain && domainType === 'subdomain' && (
                  <p className="text-xs text-muted-foreground">
                    Your subdomain will be: {primaryDomain || 'yourcompany'}.oasys360.com
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Company Profile */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Your Company Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="TH">Thailand</SelectItem>
                      <SelectItem value="ID">Indonesia</SelectItem>
                      <SelectItem value="PH">Philippines</SelectItem>
                      <SelectItem value="VN">Vietnam</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={industryCode} onValueChange={setIndustryCode}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (MY)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (SG)</SelectItem>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok (TH)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (US)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currencyCode} onValueChange={setCurrencyCode}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    <SelectItem value="THB">THB - Thai Baht</SelectItem>
                    <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                    <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                    <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  type="url"
                  placeholder="https://"
                />
              </div>
            </div>
          )}

          {/* Step 4: Presets (Auto-provisioned) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {presetProgress ? `${presetProgress.currentStep} / ${presetProgress.totalSteps}` : '0 / 7'}
                      </span>
                    </div>
                    <Progress 
                      value={presetProgress?.overallProgress || 0} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {presetProgress?.currentPreset || 'Starting...'}
                    </p>
                  </div>

                  {/* Current Preset Progress */}
                  {presetProgress && presetProgress.currentStep > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Current: {presetProgress.currentPreset}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((presetProgress.currentStep / presetProgress.totalSteps) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(presetProgress.currentStep / presetProgress.totalSteps) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Detailed Progress List */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Provisioning Master Data:</p>
                    <div className="space-y-2">
                      {presetProgress && Object.entries(presetProgress.details).map(([key, detail]) => {
                        // Special handling for currency preset
                        const displayName = key === 'currency' 
                          ? 'Currency & Exchange Rates' 
                          : detail.name || key
                        const displayText = key === 'currency' && detail.success
                          ? 'Currency & Exchange Rates configured'
                          : detail.record_count > 0 
                            ? `${detail.record_count} records` 
                            : 'Configuring...'
                        
                        return (
                          <div key={key} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                              {detail.success ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                              <span className="text-sm">{displayName}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {displayText}
                            </span>
                          </div>
                        )
                      })}
                      {(!presetProgress || Object.keys(presetProgress.details).length === 0) && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm">Initializing preset engine...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Automatically configuring your account based on your country and industry...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {presetsStatus && presetProgress && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium">Presets Provisioned:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(presetProgress.details).map(([key, detail]) => {
                            // Special handling for currency preset
                            const displayName = key === 'currency' 
                              ? 'Currency & Exchange Rates' 
                              : detail.name || key
                            const displayText = key === 'currency'
                              ? 'Currency & Exchange Rates configured'
                              : `${detail.record_count} ${detail.record_count === 1 ? 'record' : 'records'} created`
                            
                            return (
                              <div key={key} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{displayName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {displayText}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Your account has been configured with all necessary presets and settings.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Setup Complete!
                  </p>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account has been configured with all necessary presets and settings.
                  You can now access the full dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Summary:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Plan: {planCode}</li>
                  <li>Domain: {primaryDomain}</li>
                  <li>Company: {legalName}</li>
                  <li>Country: {countryCode}</li>
                  <li>Industry: {industryCode}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentStep === 5 ? (
                'Complete Setup'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

