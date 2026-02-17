/**
 * API Endpoint Testing Script
 * Utility script to test API endpoints manually
 * Usage: npx ts-node __tests__/scripts/test-api-endpoints.ts
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Mock token (should be replaced with actual token from login)
let accessToken = process.env.ACCESS_TOKEN || '';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pass' | 'fail' | 'skip';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

const testResults: TestResult[] = [];

// Helper function to make API request
async function testEndpoint(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
      validateStatus: () => true, // Don't throw on any status
    });

    const responseTime = Date.now() - startTime;

    return {
      endpoint,
      method,
      status: response.status >= 200 && response.status < 300 ? 'pass' : 'fail',
      statusCode: response.status,
      responseTime,
      error: response.status >= 400 ? JSON.stringify(response.data).substring(0, 100) : undefined,
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 'fail',
      error: error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

// Test functions for each feature
async function testTaxOptimization() {
  console.log('\n🧪 Testing Tax Optimization API...');
  
  testResults.push(await testEndpoint('GET', '/tax_optimization/events/?page=1&limit=10'));
  testResults.push(await testEndpoint('GET', '/tax_optimization/strategies/?page=1&limit=10'));
  testResults.push(await testEndpoint('GET', '/tax_optimization/alerts/'));
  testResults.push(await testEndpoint('GET', '/tax_optimization/stats/'));
}

async function testTreasury() {
  console.log('\n🧪 Testing Treasury API...');
  
  testResults.push(await testEndpoint('GET', '/treasury/unified/'));
  testResults.push(await testEndpoint('GET', '/treasury/historical/?start_date=2024-01-01&end_date=2024-01-31'));
  testResults.push(await testEndpoint('GET', '/treasury/runway/?burn_rate=5000'));
}

async function testFxConversion() {
  console.log('\n🧪 Testing FX Conversion API...');
  
  testResults.push(await testEndpoint('GET', '/fx_conversion/rate/?from=USD&to=EUR'));
  testResults.push(await testEndpoint('GET', '/fx_conversion/currencies/'));
  testResults.push(await testEndpoint('GET', '/fx_conversion/rates/?base=USD'));
}

async function testVendorVerification() {
  console.log('\n🧪 Testing Vendor Verification API...');
  
  testResults.push(await testEndpoint('GET', '/purchase/vendor-wallets/'));
  testResults.push(await testEndpoint('GET', '/purchase/verification-logs/'));
  testResults.push(await testEndpoint('GET', '/purchase/payment-blocks/'));
}

async function testErpIntegration() {
  console.log('\n🧪 Testing ERP Integration API...');
  
  testResults.push(await testEndpoint('GET', '/erp_integration/connections/'));
  testResults.push(await testEndpoint('GET', '/erp_integration/sync-logs/'));
  testResults.push(await testEndpoint('GET', '/erp_integration/mappings/'));
}

async function testGnosisSafe() {
  console.log('\n🧪 Testing Gnosis Safe API...');
  
  testResults.push(await testEndpoint('GET', '/web3/gnosis/safes/'));
}

async function testCoinbasePrime() {
  console.log('\n🧪 Testing Coinbase Prime API...');
  
  testResults.push(await testEndpoint('GET', '/web3/coinbase/connections/'));
  testResults.push(await testEndpoint('GET', '/web3/coinbase/accounts/'));
  testResults.push(await testEndpoint('GET', '/web3/coinbase/orders/'));
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log(`API Base URL: ${API_URL}`);
  console.log(`Access Token: ${accessToken ? 'Set' : 'Not Set (tests may fail)'}\n`);

  try {
    await testTaxOptimization();
    await testTreasury();
    await testFxConversion();
    await testVendorVerification();
    await testErpIntegration();
    await testGnosisSafe();
    await testCoinbasePrime();

    // Print summary
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(60));
    
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;

    console.log(`Total Tests: ${testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:');
    console.log('='.repeat(60));
    
    testResults.forEach((result) => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} [${result.method}] ${result.endpoint}`);
      if (result.statusCode) {
        console.log(`   Status: ${result.statusCode}`);
      }
      if (result.responseTime) {
        console.log(`   Time: ${result.responseTime}ms`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests if executed directly
if (require.main === module) {
  if (!accessToken) {
    console.warn('⚠️  No access token provided. Set ACCESS_TOKEN environment variable.');
    console.warn('   Example: ACCESS_TOKEN=your-token npx ts-node __tests__/scripts/test-api-endpoints.ts\n');
  }

  runAllTests().catch(console.error);
}

export { testEndpoint, runAllTests };

