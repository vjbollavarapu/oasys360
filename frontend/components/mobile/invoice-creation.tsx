"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Save, Send, Eye, Trash2, Settings, Brain, CreditCard, Wallet } from "lucide-react"

export function MobileInvoiceCreation() {
  const [step, setStep] = useState(1)
  const [invoiceData, setInvoiceData] = useState({
    customer: "",
    invoiceNumber:
      "INV-2024-" +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0"),
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "USD",
    taxRate: 10,
    discount: 0,
    notes: "",
    terms: "",
    recurring: false,
    paymentMethods: ["stripe", "crypto"],
  })

  const [lineItems, setLineItems] = useState([{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }])

  const [aiSuggestions, setAiSuggestions] = useState({
    enabled: true,
    suggestedRate: 150,
    suggestedTerms: "Net 30 days",
    suggestedTax: 10,
  })

  const customers = [
    { id: "1", name: "TechCorp Solutions", email: "billing@techcorp.com", currency: "USD" },
    { id: "2", name: "Global Dynamics", email: "finance@globaldynamics.com", currency: "EUR" },
    { id: "3", name: "StartupCorp", email: "accounts@startupcorp.com", currency: "USD" },
    { id: "4", name: "CryptoTech Ltd", email: "payments@cryptotech.io", currency: "ETH" },
  ]

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map((item) => item.id)) + 1
    setLineItems([...lineItems, { id: newId, description: "", quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate
          }
          return updated
        }
        return item
      }),
    )
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * invoiceData.taxRate) / 100
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * invoiceData.discount) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount()
  }

  const steps = [
    { number: 1, title: "Customer", description: "Select customer and basic details" },
    { number: 2, title: "Items", description: "Add products or services" },
    { number: 3, title: "Details", description: "Tax, discount, and terms" },
    { number: 4, title: "Review", description: "Final review and send" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Create Invoice</h1>
              <p className="text-sm text-gray-500">{invoiceData.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Invoice Settings</SheetTitle>
                  <SheetDescription>Configure invoice preferences</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>AI Suggestions</Label>
                    <Switch
                      checked={aiSuggestions.enabled}
                      onCheckedChange={(checked) => setAiSuggestions({ ...aiSuggestions, enabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-save Draft</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Recurring Invoice</Label>
                    <Switch
                      checked={invoiceData.recurring}
                      onCheckedChange={(checked) => setInvoiceData({ ...invoiceData, recurring: checked })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="sm" className="p-2">
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepItem.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepItem.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${step > stepItem.number ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 space-y-4">
          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                  <CardDescription>Select or add a customer for this invoice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Customer</Label>
                    <Select
                      value={invoiceData.customer}
                      onValueChange={(value) => setInvoiceData({ ...invoiceData, customer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              <span className="text-sm text-gray-500">{customer.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Invoice Date</Label>
                      <Input
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={invoiceData.currency}
                      onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                        <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {aiSuggestions.enabled && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">AI Suggestion</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Based on previous invoices to this customer, consider using {aiSuggestions.suggestedTerms}{" "}
                        payment terms.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Line Items */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Invoice Items</CardTitle>
                      <CardDescription>Add products or services</CardDescription>
                    </div>
                    <Button size="sm" onClick={addLineItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {lineItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Product or service description"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Rate</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <Input type="number" value={item.amount.toFixed(2)} readOnly className="bg-gray-50" />
                        </div>
                      </div>

                      {aiSuggestions.enabled && index === 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">AI Suggestion</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Similar services are typically priced at ${aiSuggestions.suggestedRate}/hour
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateLineItem(item.id, "rate", aiSuggestions.suggestedRate)}
                          >
                            Apply Suggestion
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Details</CardTitle>
                  <CardDescription>Configure tax, discount, and payment terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={invoiceData.taxRate}
                        onChange={(e) =>
                          setInvoiceData({ ...invoiceData, taxRate: Number.parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={invoiceData.discount}
                        onChange={(e) =>
                          setInvoiceData({ ...invoiceData, discount: Number.parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Terms</Label>
                    <Textarea
                      placeholder="e.g., Net 30 days, Due on receipt"
                      value={invoiceData.terms}
                      onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes for the customer"
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Payment Methods</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm">Stripe</span>
                        </div>
                        <Switch
                          checked={invoiceData.paymentMethods.includes("stripe")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInvoiceData({
                                ...invoiceData,
                                paymentMethods: [...invoiceData.paymentMethods, "stripe"],
                              })
                            } else {
                              setInvoiceData({
                                ...invoiceData,
                                paymentMethods: invoiceData.paymentMethods.filter((method) => method !== "stripe"),
                              })
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span className="text-sm">Crypto</span>
                        </div>
                        <Switch
                          checked={invoiceData.paymentMethods.includes("crypto")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInvoiceData({
                                ...invoiceData,
                                paymentMethods: [...invoiceData.paymentMethods, "crypto"],
                              })
                            } else {
                              setInvoiceData({
                                ...invoiceData,
                                paymentMethods: invoiceData.paymentMethods.filter((method) => method !== "crypto"),
                              })
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({invoiceData.taxRate}%)</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    {invoiceData.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({invoiceData.discount}%)</span>
                        <span>-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Preview</CardTitle>
                  <CardDescription>Review before sending to customer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold">INVOICE</h2>
                        <p className="text-gray-600">{invoiceData.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date: {invoiceData.date}</p>
                        <p className="text-sm text-gray-600">Due: {invoiceData.dueDate}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Bill To:</h3>
                      <p className="text-gray-600">
                        {customers.find((c) => c.id === invoiceData.customer)?.name || "Select Customer"}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {lineItems.map((item, index) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.description || `Item ${index + 1}`}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ${item.rate.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">${item.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      {invoiceData.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${calculateDiscount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>
                          ${calculateTotal().toFixed(2)} {invoiceData.currency}
                        </span>
                      </div>
                    </div>

                    {invoiceData.terms && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium mb-1">Payment Terms</h4>
                        <p className="text-sm text-gray-600">{invoiceData.terms}</p>
                      </div>
                    )}

                    {invoiceData.notes && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send Invoice
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send Invoice?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will send the invoice to the customer via email and make it available for payment.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Send Invoice</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)} className="flex-1 mr-2">
            Previous
          </Button>
          <Button
            onClick={() => {
              if (step < 4) {
                setStep(step + 1)
              }
            }}
            disabled={step === 4}
            className="flex-1 ml-2"
          >
            {step === 4 ? "Complete" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
