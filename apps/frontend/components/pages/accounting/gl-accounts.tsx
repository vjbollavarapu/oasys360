"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  FileText,
  Plus,
} from "lucide-react"

// Enhanced G/L Accounts Tree based on AutoCount reference
const glAccountsTree = [
  // CURRENT ASSETS
  {
    code: "100-0000",
    name: "CURRENT ASSETS",
    type: "Asset",
    accountType: "normal",
    balance: 0,
    isHeader: true,
    children: [
      {
        code: "110-0000",
        name: "CAPITAL",
        type: "Asset",
        accountType: "normal",
        balance: 200000.00,
        children: [
          { code: "110-0001", name: "SHARE CAPITAL", type: "Asset", accountType: "normal", balance: 200000.00 }
        ]
      },
      {
        code: "150-0000",
        name: "RETAINED EARNING",
        type: "Asset",
        accountType: "special",
        balance: 78800.00,
        children: [
          { code: "151-0000", name: "RESERVES", type: "Asset", accountType: "special", balance: 78800.00 }
        ]
      }
    ]
  },
  
  // FIXED ASSETS
  {
    code: "200-0000",
    name: "FIXED ASSETS",
    type: "Asset",
    accountType: "normal",
    balance: 0,
    isHeader: true,
    children: [
      {
        code: "200-1000",
        name: "MOTOR VEHICLES",
        type: "Asset",
        accountType: "normal",
        balance: 70000.00,
        children: []
      },
      {
        code: "200-1005",
        name: "ACCUM. DEPRN. - MOTOR VEHICLES",
        type: "Asset",
        accountType: "normal", 
        balance: -14000.00,
        children: []
      },
    ]
  },

  // CURRENT LIABILITIES
  {
    code: "400-0000",
    name: "CURRENT LIABILITIES",
    type: "Liability",
    accountType: "normal",
    balance: 0,
    isHeader: true,
    children: [
      {
        code: "400-0000",
        name: "TRADE CREDITORS",
        type: "Liability",
        accountType: "normal",
        balance: 22200.00,
        children: []
      },
    ]
  },

  // INCOME
  {
    code: "500-0000",
    name: "INCOME",
    type: "Income",
    accountType: "normal",
    balance: 0,
    isHeader: true,
    children: [
      {
        code: "500-1000",
        name: "SALES",
        type: "Income",
        accountType: "normal",
        balance: 125000.00,
        children: []
      },
    ]
  },

  // EXPENSES
  {
    code: "600-0000",
    name: "EXPENSES",
    type: "Expense",
    accountType: "normal",
    balance: 0,
    isHeader: true,
    children: [
      {
        code: "600-1000",
        name: "COST OF GOODS SOLD",
        type: "Expense",
        accountType: "normal",
        balance: 65000.00,
        children: []
      },
    ]
  }
]

export function GLAccountsOverview() {
  return <GLAccountsTab />;
}

export function GLAccountsTab() {
  const [isCreateGLAccountOpen, setIsCreateGLAccountOpen] = useState(false)
  const [expandedAccounts, setExpandedAccounts] = useState<{ [code: string]: boolean }>({})

  const toggleExpand = (code: string) => {
    setExpandedAccounts(prev => ({ ...prev, [code]: !prev[code] }))
  }

  return (
    <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Account Maintenance
            </CardTitle>
            <CardDescription>Account Maintenance is the place you can create, edit, or delete accounts.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              Print Chart of Account
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <Plus className="w-4 h-4 mr-2" />
              New Special Account
            </Button>
            <Dialog open={isCreateGLAccountOpen} onOpenChange={setIsCreateGLAccountOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Normal Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Create New General Ledger Account</DialogTitle>
                  <DialogDescription>
                    Add a new account to your chart of accounts with complete details
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="account-code">Account Code</Label>
                        <Input id="account-code" placeholder="e.g., 1000" className="rounded-xl" />
                      </div>
                      <div>
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input id="account-name" placeholder="e.g., Cash and Cash Equivalents" className="rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="account-type">Account Type</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="account-description">Description</Label>
                      <Textarea id="account-description" placeholder="Detailed description of the account..." className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="opening-balance">Opening Balance</Label>
                        <Input id="opening-balance" type="number" placeholder="0.00" className="rounded-xl" />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="allow-posting" defaultChecked />
                      <Label htmlFor="allow-posting">Allow posting to this account</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="require-approval" />
                      <Label htmlFor="require-approval">Require approval for transactions</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button variant="outline" className="rounded-full" onClick={() => setIsCreateGLAccountOpen(false)}>Cancel</Button>
                  <Button className="rounded-full">Create Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Account Code</TableHead>
                <TableHead className="font-semibold">Account Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {glAccountsTree.map((account) => (
                <React.Fragment key={account.code}>
                  <TableRow 
                    className={`hover:bg-muted/30 transition-colors ${
                      account.accountType === 'special' ? 'bg-blue-50 border-l-4 border-l-blue-400' : 
                      account.isHeader ? 'bg-amber-50 font-semibold' : ''
                    }`}
                  >
                    <TableCell className="font-mono">
                      {account.children && account.children.length > 0 ? (
                        <button
                          className="mr-2 text-lg font-bold text-blue-600 hover:text-blue-800"
                          onClick={() => toggleExpand(account.code)}
                          aria-label={expandedAccounts[account.code] ? 'Collapse' : 'Expand'}
                        >
                          {expandedAccounts[account.code] ? '-' : '+'}
                        </button>
                      ) : (
                        <span className="mr-2 text-lg text-gray-400">•</span>
                      )}
                      <span className={account.accountType === 'special' ? 'text-blue-700 font-semibold' : ''}>
                        {account.code}
                      </span>
                    </TableCell>
                    <TableCell className={`font-medium ${account.accountType === 'special' ? 'text-blue-700' : ''}`}>
                      {account.name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={account.accountType === 'special' ? 'default' : 'outline'} 
                        className={`rounded-full ${
                          account.accountType === 'special' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''
                        }`}
                      >
                        {account.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${
                      account.balance < 0 ? 'text-red-600' : 
                      account.balance > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {account.balance === 0 ? '-' : `${account.balance.toLocaleString()}.00`}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={account.accountType === 'special' ? 'default' : 'secondary'} 
                        className="rounded-full"
                      >
                        {account.accountType === 'special' ? 'Special' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedAccounts[account.code] && account.children && account.children.map(child => (
                    <TableRow key={child.code} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono pl-8">
                        <span className="mr-2 text-lg text-gray-400">•</span>
                        {child.code}
                      </TableCell>
                      <TableCell className="font-medium pl-8">{child.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{child.type}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${
                        child.balance < 0 ? 'text-red-600' : 
                        child.balance > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {child.balance === 0 ? '-' : `${child.balance.toLocaleString()}.00`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 