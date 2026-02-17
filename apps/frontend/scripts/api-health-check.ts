/**
 * API Health Check Script
 * Quick health check for all API endpoints
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

interface HealthCheckResult {
  feature: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  error?: string;
}

async function healthCheck(endpoint: string, feature: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startTime;
    
    return {
      feature,
      endpoint,
      status: response.status === 200 || response.status === 401 ? 'healthy' : 'unhealthy',
      responseTime,
      error: response.status >= 400 ? `HTTP ${response.status}` : undefined,
    };
  } catch (error: any) {
    return {
      feature,
      endpoint,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function runHealthCheck() {
  console.log('🏥 API Health Check\n');
  console.log(`Checking: ${API_URL}\n`);

  const checks: Promise<HealthCheckResult>[] = [
    healthCheck('/tax_optimization/stats/', 'Tax Optimization'),
    healthCheck('/treasury/unified/', 'Treasury'),
    healthCheck('/fx_conversion/currencies/', 'FX Conversion'),
    healthCheck('/purchase/vendor-wallets/', 'Vendor Verification'),
    healthCheck('/erp_integration/connections/', 'ERP Integration'),
    healthCheck('/web3/gnosis/safes/', 'Gnosis Safe'),
    healthCheck('/web3/coinbase/connections/', 'Coinbase Prime'),
  ];

  const results = await Promise.all(checks);

  console.log('Results:');
  console.log('='.repeat(70));
  
  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : result.status === 'unhealthy' ? '❌' : '⚠️';
    console.log(`${icon} ${result.feature.padEnd(25)} ${result.endpoint.padEnd(30)} ${result.responseTime}ms`);
    if (result.error) {
      console.log(`   └─ Error: ${result.error}`);
    }
  });

  const healthy = results.filter(r => r.status === 'healthy').length;
  const unhealthy = results.filter(r => r.status === 'unhealthy').length;

  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${results.length} | Healthy: ${healthy} | Unhealthy: ${unhealthy}`);
  
  if (unhealthy > 0) {
    process.exit(1);
  }
}

runHealthCheck().catch(console.error);

