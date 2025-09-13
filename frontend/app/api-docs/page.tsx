import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code,
  Key,
  Shield,
  BookOpen,
  Download,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Zap,
  Globe
} from 'lucide-react'

export default function APIDocsPage() {
  const codeExamples = {
    javascript: `// Install the SDK
npm install @oasys/sdk

// Initialize the client
import { OasysClient } from '@oasys/sdk';

const client = new OasysClient({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.oasys.com/v1'
});

// Get all transactions
const transactions = await client.transactions.list({
  limit: 50,
  status: 'completed'
});

// Create an invoice
const invoice = await client.invoices.create({
  customer_id: 'cust_123',
  amount: 1000,
  currency: 'USD',
  items: [{
    description: 'Consulting services',
    quantity: 1,
    price: 1000
  }]
});`,
    python: `# Install the SDK
pip install oasys-python

# Initialize the client
from oasys import OasysClient

client = OasysClient(
    api_key='your_api_key_here',
    base_url='https://api.oasys.com/v1'
)

# Get all transactions
transactions = client.transactions.list(
    limit=50,
    status='completed'
)

# Create an invoice
invoice = client.invoices.create(
    customer_id='cust_123',
    amount=1000,
    currency='USD',
    items=[{
        'description': 'Consulting services',
        'quantity': 1,
        'price': 1000
    }]
)`,
    curl: `# Authentication
curl -H "Authorization: Bearer your_api_key_here" \\
     -H "Content-Type: application/json" \\
     https://api.oasys.com/v1/transactions

# Create an invoice
curl -X POST https://api.oasys.com/v1/invoices \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "cust_123",
    "amount": 1000,
    "currency": "USD",
    "items": [{
      "description": "Consulting services",
      "quantity": 1,
      "price": 1000
    }]
  }'`
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/transactions',
      description: 'List all transactions',
      params: ['limit', 'offset', 'status', 'date_from', 'date_to']
    },
    {
      method: 'POST',
      path: '/transactions',
      description: 'Create a new transaction',
      params: ['amount', 'currency', 'description', 'category']
    },
    {
      method: 'GET',
      path: '/invoices',
      description: 'List all invoices',
      params: ['limit', 'offset', 'status', 'customer_id']
    },
    {
      method: 'POST',
      path: '/invoices',
      description: 'Create a new invoice',
      params: ['customer_id', 'amount', 'currency', 'items']
    },
    {
      method: 'GET',
      path: '/reports/financial',
      description: 'Generate financial reports',
      params: ['type', 'period', 'format']
    },
    {
      method: 'POST',
      path: '/documents/process',
      description: 'Process documents with AI',
      params: ['file', 'type', 'auto_categorize']
    },
    {
      method: 'GET',
      path: '/customers',
      description: 'List all customers',
      params: ['limit', 'offset', 'search']
    },
    {
      method: 'POST',
      path: '/webhooks',
      description: 'Configure webhooks',
      params: ['url', 'events', 'secret']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              OASYS API Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Integrate OASYS with your applications using our powerful REST API
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Key className="w-5 h-5 mr-2" />
                Get API Key
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download Postman Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a href="#authentication" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Authentication
                  </a>
                  <a href="#endpoints" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    API Endpoints
                  </a>
                  <a href="#examples" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Code Examples
                  </a>
                  <a href="#webhooks" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Webhooks
                  </a>
                  <a href="#errors" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Error Handling
                  </a>
                  <a href="#rate-limits" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Rate Limits
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">API Overview</CardTitle>
                <CardDescription className="text-blue-600">
                  The OASYS API provides programmatic access to all core platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <Globe className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900">Base URL</h4>
                    <code className="text-sm text-blue-700">https://api.oasys.com/v1</code>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <Shield className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900">Authentication</h4>
                    <p className="text-sm text-blue-700">Bearer Token (API Key)</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <Zap className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900">Response Format</h4>
                    <p className="text-sm text-blue-700">JSON with HTTPS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Authenticate your requests using API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Get Your API Key</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        <li>Log in to your OASYS dashboard</li>
                        <li>Navigate to Settings → API Keys</li>
                        <li>Click "Generate New Key"</li>
                        <li>Copy and securely store your key</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Authorization Header</h4>
                      <div className="bg-white p-3 rounded border">
                        <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">Security Best Practices</h4>
                          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                            <li>• Never expose API keys in client-side code</li>
                            <li>• Use environment variables to store keys</li>
                            <li>• Rotate keys regularly</li>
                            <li>• Use different keys for development and production</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Complete reference of available endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {endpoints.map((endpoint, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            endpoint.method === 'GET' ? "bg-blue-100 text-blue-700" :
                            endpoint.method === 'POST' ? "bg-green-100 text-green-700" :
                            endpoint.method === 'PUT' ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          }>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{endpoint.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {endpoint.params.map((param, pidx) => (
                            <Badge key={pidx} variant="outline" className="text-xs">
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Code Examples */}
            <section id="examples">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>
                    Get started quickly with these code samples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <pre className="text-sm overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                  <CardDescription>
                    API usage limits by subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Starter</h4>
                      <p className="text-2xl font-bold text-blue-600">1,000</p>
                      <p className="text-sm text-gray-600">requests per hour</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Growth</h4>
                      <p className="text-2xl font-bold text-green-600">10,000</p>
                      <p className="text-sm text-gray-600">requests per hour</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Enterprise</h4>
                      <p className="text-2xl font-bold text-purple-600">Unlimited</p>
                      <p className="text-sm text-gray-600">custom limits available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Support */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Need API Support?</h2>
                <p className="mb-6 opacity-90">
                  Our technical team is here to help you integrate successfully.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      <BookOpen className="w-5 h-5 mr-2" />
                      View Full Docs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 