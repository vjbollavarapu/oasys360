#!/usr/bin/env node

/**
 * E2E Test Runner
 * Comprehensive test runner for end-to-end testing of the multi-tenant application
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Test configuration
const testConfig = {
  // Test categories
  categories: {
    auth: {
      name: 'Authentication Flow',
      pattern: 'auth-flow.e2e.test.tsx',
      description: 'Tests authentication, login, logout, and session management'
    },
    tenant: {
      name: 'Tenant Isolation',
      pattern: 'tenant-isolation.e2e.test.tsx',
      description: 'Tests tenant data isolation and multi-tenancy features'
    },
    business: {
      name: 'Business Flows',
      pattern: 'business-flows.e2e.test.tsx',
      description: 'Tests complete business workflows (accounting, banking, invoicing, AI)'
    }
  },
  
  // Test environments
  environments: {
    development: {
      name: 'Development',
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:8000',
      description: 'Local development environment'
    },
    staging: {
      name: 'Staging',
      baseUrl: 'https://staging.oasys360.com',
      apiUrl: 'https://api-staging.oasys360.com',
      description: 'Staging environment for testing'
    },
    production: {
      name: 'Production',
      baseUrl: 'https://app.oasys360.com',
      apiUrl: 'https://api.oasys360.com',
      description: 'Production environment (read-only tests)'
    }
  }
}

// Test utilities
class E2ETestRunner {
  constructor(options = {}) {
    this.options = {
      environment: 'development',
      category: 'all',
      verbose: false,
      coverage: false,
      parallel: false,
      timeout: 30000,
      ...options
    }
    
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0
    }
  }

  // Run all e2e tests
  async runAllTests() {
    console.log('🚀 Starting E2E Test Suite')
    console.log(`📊 Environment: ${testConfig.environments[this.options.environment].name}`)
    console.log(`📋 Category: ${this.options.category === 'all' ? 'All Categories' : testConfig.categories[this.options.category].name}`)
    console.log('=' * 60)

    const startTime = Date.now()

    try {
      // Set up test environment
      await this.setupEnvironment()

      // Run tests based on category
      if (this.options.category === 'all') {
        await this.runCategoryTests('auth')
        await this.runCategoryTests('tenant')
        await this.runCategoryTests('business')
      } else {
        await this.runCategoryTests(this.options.category)
      }

      // Generate report
      await this.generateReport()

    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
      process.exit(1)
    } finally {
      // Cleanup
      await this.cleanup()
    }

    const endTime = Date.now()
    this.results.duration = endTime - startTime

    console.log('\n' + '=' * 60)
    console.log('📊 Test Results Summary')
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`⏭️  Skipped: ${this.results.skipped}`)
    console.log(`⏱️  Duration: ${this.formatDuration(this.results.duration)}`)
    console.log('=' * 60)

    if (this.results.failed > 0) {
      process.exit(1)
    }
  }

  // Set up test environment
  async setupEnvironment() {
    console.log('🔧 Setting up test environment...')

    // Set environment variables
    process.env.NODE_ENV = 'test'
    process.env.NEXT_PUBLIC_API_URL = testConfig.environments[this.options.environment].apiUrl
    process.env.NEXT_PUBLIC_BASE_URL = testConfig.environments[this.options.environment].baseUrl

    // Create test database if needed
    if (this.options.environment === 'development') {
      try {
        execSync('npm run db:setup:test', { stdio: 'inherit' })
      } catch (error) {
        console.warn('⚠️  Could not set up test database:', error.message)
      }
    }

    console.log('✅ Test environment ready')
  }

  // Run tests for a specific category
  async runCategoryTests(category) {
    const categoryConfig = testConfig.categories[category]
    console.log(`\n🧪 Running ${categoryConfig.name} Tests`)
    console.log(`📝 ${categoryConfig.description}`)
    console.log('-'.repeat(50))

    const testFile = path.join(__dirname, `${categoryConfig.pattern}`)
    
    if (!fs.existsSync(testFile)) {
      console.log(`⚠️  Test file not found: ${testFile}`)
      return
    }

    try {
      const startTime = Date.now()
      
      // Run Jest with specific test file
      const jestCommand = this.buildJestCommand(testFile)
      const output = execSync(jestCommand, { 
        encoding: 'utf8',
        stdio: this.options.verbose ? 'inherit' : 'pipe'
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // Parse Jest output for results
      this.parseJestOutput(output, category, duration)

    } catch (error) {
      console.error(`❌ ${categoryConfig.name} tests failed:`, error.message)
      this.results.failed++
    }
  }

  // Build Jest command
  buildJestCommand(testFile) {
    const baseCommand = 'npx jest'
    const args = [
      testFile,
      '--testEnvironment=jsdom',
      '--setupFilesAfterEnv=<rootDir>/jest.setup.js',
      '--verbose',
      '--no-cache'
    ]

    if (this.options.coverage) {
      args.push('--coverage')
    }

    if (this.options.timeout) {
      args.push(`--testTimeout=${this.options.timeout}`)
    }

    if (this.options.parallel) {
      args.push('--maxWorkers=4')
    }

    return `${baseCommand} ${args.join(' ')}`
  }

  // Parse Jest output for results
  parseJestOutput(output, category, duration) {
    // Extract test results from Jest output
    const passedMatch = output.match(/(\d+) passing/)
    const failedMatch = output.match(/(\d+) failing/)
    const skippedMatch = output.match(/(\d+) pending/)

    if (passedMatch) {
      this.results.passed += parseInt(passedMatch[1])
    }
    if (failedMatch) {
      this.results.failed += parseInt(failedMatch[1])
    }
    if (skippedMatch) {
      this.results.skipped += parseInt(skippedMatch[1])
    }

    console.log(`✅ ${category} tests completed in ${this.formatDuration(duration)}`)
  }

  // Generate test report
  async generateReport() {
    console.log('\n📊 Generating test report...')

    const report = {
      timestamp: new Date().toISOString(),
      environment: this.options.environment,
      category: this.options.category,
      results: this.results,
      summary: {
        success: this.results.failed === 0,
        coverage: this.options.coverage ? 'Generated' : 'Not requested'
      }
    }

    // Save report to file
    const reportPath = path.join(__dirname, '..', '..', 'coverage', 'e2e-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`📄 Report saved to: ${reportPath}`)
  }

  // Cleanup after tests
  async cleanup() {
    console.log('\n🧹 Cleaning up...')

    // Clear any test data
    if (this.options.environment === 'development') {
      try {
        execSync('npm run db:cleanup:test', { stdio: 'inherit' })
      } catch (error) {
        console.warn('⚠️  Could not cleanup test database:', error.message)
      }
    }

    console.log('✅ Cleanup completed')
  }

  // Format duration
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }
}

// CLI interface
function parseArguments() {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--env':
      case '-e':
        options.environment = args[++i] || 'development'
        break
      case '--category':
      case '-c':
        options.category = args[++i] || 'all'
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--coverage':
        options.coverage = true
        break
      case '--parallel':
      case '-p':
        options.parallel = true
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) || 30000
        break
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break
      default:
        console.warn(`Unknown option: ${arg}`)
    }
  }

  return options
}

// Show help
function showHelp() {
  console.log(`
🧪 E2E Test Runner for OASYS Multi-Tenant Application

Usage: node run-e2e-tests.js [options]

Options:
  -e, --env <environment>    Test environment (development|staging|production)
  -c, --category <category>  Test category (auth|tenant|business|all)
  -v, --verbose             Verbose output
  --coverage                Generate coverage report
  -p, --parallel            Run tests in parallel
  -t, --timeout <ms>        Test timeout in milliseconds
  -h, --help                Show this help

Examples:
  node run-e2e-tests.js --env development --category auth
  node run-e2e-tests.js --env staging --category all --coverage
  node run-e2e-tests.js --env production --category business --verbose
`)
}

// Main execution
async function main() {
  const options = parseArguments()
  const runner = new E2ETestRunner(options)
  
  try {
    await runner.runAllTests()
  } catch (error) {
    console.error('❌ Test runner failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { E2ETestRunner, testConfig }
