"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Eye, 
  Download, 
  Upload,
  Calculator,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Hash,
  Tag,
  Globe,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit,
  Copy,
  Share,
  Printer,
  Mail,
  MessageSquare,
  CreditCard,
  Banknote,
  Receipt,
  FileSpreadsheet,
  FilePdf,
  FileImage,
  FileX,
  FileCheck,
  FileClock,
  FileAlert,
  FileMinus,
  FilePlus,
  FileEdit,
  FileSearch,
  FileBarChart,
  FilePieChart,
  FileLineChart,
  FileTrendingUp,
  FileTrendingDown,
  FileDollarSign,
  FilePercent,
  FileShield,
  FileKey,
  FileGlobe,
  FileUsers,
  FileBuilding,
  FileCreditCard,
  FileBanknote,
  FilePiggyBank,
  FileActivity,
  FileTarget,
  FileAward,
  FileStar,
  FileEye,
  FileTrash,
  FileMore,
  FileArrowUp,
  FileArrowDown,
  FileMinus as FileMinusIcon,
  FilePlus as FilePlusIcon,
  FileEqual,
  FileDivide,
  FileHash,
  FileTag,
} from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  address: string
  taxId: string
  country: string
}

export function CreateInvoiceForm() {
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    customer: "",
    currency: "USD",
    notes: "",
    terms: "",
    status: "draft"
  })
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Mock customers data
  useEffect(() => {
    setCustomers([
      {
        id: "1",
        name: "Acme Corporation",
        email: "accounts@acme.com",
        address: "123 Business St, New York, NY 10001",
        taxId: "12-3456789",
        country: "US"
      },
      {
        id: "2",
        name: "Tech Solutions Ltd",
        email: "finance@techsolutions.com",
        address: "456 Innovation Ave, San Francisco, CA 94102",
        taxId: "98-7654321",
        country: "US"
      },
      {
        id: "3",
        name: "Global Industries",
        email: "accounts@globalindustries.com",
        address: "789 Corporate Blvd, London, UK SW1A 1AA",
        taxId: "GB123456789",
        country: "GB"
      }
    ])
  }, [])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate total
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice * (1 + updatedItem.taxRate / 100)
        return updatedItem
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0)
  const total = subtotal + taxTotal

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Invoice saved:", { invoiceData, items, total })
      // Show success message
    } catch (error) {
      console.error("Error saving invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Invoice sent:", { invoiceData, items, total })
      // Show success message
    } catch (error) {
      console.error("Error sending invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Create and send professional invoices with e-invoicing compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isLoading} className="rounded-full">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" disabled={isLoading} className="rounded-full">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSend} disabled={isLoading} className="rounded-full">
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>
                  Basic invoice details and numbering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                    placeholder="INV-2024-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData({...invoiceData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Select or add customer details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select onValueChange={(value) => {
                    const customer = customers.find(c => c.id === value)
                    setSelectedCustomer(customer || null)
                    setInvoiceData({...invoiceData, customer: value})
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCustomer && (
                  <div className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedCustomer.country}</Badge>
                      <Badge variant="outline">Tax ID: {selectedCustomer.taxId}</Badge>
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Notes, terms, and additional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                  placeholder="Additional notes for the customer..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData({...invoiceData, terms: e.target.value})}
                  placeholder="Payment terms and conditions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Add products or services to the invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Product or service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Total</Label>
                      <div className="p-2 bg-muted rounded text-sm font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>E-Invoicing Compliance</CardTitle>
                <CardDescription>
                  Configure e-invoicing requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Peppol Network</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Global e-invoicing network for B2B transactions
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Tax Compliance</span>
                    <Badge variant="outline">Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatic tax calculation and validation
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Digital Signature</span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Electronic signature for legal compliance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Options</CardTitle>
                <CardDescription>
                  Choose how to send the invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email to customer</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send directly to customer's email address
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>E-Invoice Network</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send via Peppol or country-specific networks
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate PDF for manual distribution
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <CardDescription>
                Review the invoice before sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-2xl p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-muted-foreground">#{invoiceData.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Your Company Name</p>
                    <p className="text-sm text-muted-foreground">123 Business Ave</p>
                    <p className="text-sm text-muted-foreground">City, State 12345</p>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedCustomer && (
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-medium mb-2">Bill To:</h3>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Issue Date:</strong> {invoiceData.issueDate}</p>
                      <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
                    </div>
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 font-medium text-sm border-b pb-2">
                    <div>Description</div>
                    <div>Qty</div>
                    <div>Unit Price</div>
                    <div>Tax</div>
                    <div>Total</div>
                  </div>
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-5 gap-4 text-sm">
                      <div>{item.description}</div>
                      <div>{item.quantity}</div>
                      <div>${item.unitPrice.toFixed(2)}</div>
                      <div>{item.taxRate}%</div>
                      <div>${item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {invoiceData.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notes:</h3>
                    <p className="text-sm text-muted-foreground">{invoiceData.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {invoiceData.terms && (
                  <div>
                    <h3 className="font-medium mb-2">Terms & Conditions:</h3>
                    <p className="text-sm text-muted-foreground">{invoiceData.terms}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
