"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp
} from "lucide-react"

export function BankReconciliationOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile bank statements with your accounting records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="rounded-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Start Reconciliation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reconciliation</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <p className="text-xs text-muted-foreground mt-2">Accounts need attention</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reconciled This Month</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-2">Successful reconciliations</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Discrepancies</CardTitle>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">$1,247.89</div>
                <p className="text-xs text-muted-foreground mt-2">Unresolved differences</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reconciliation Rate</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Reconciliation Status</CardTitle>
              <CardDescription>
                Current status of bank account reconciliations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Chase Bank - Checking</p>
                      <p className="text-sm text-muted-foreground">Last reconciled: Dec 15, 2024</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Reconciled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">Wells Fargo - Savings</p>
                      <p className="text-sm text-muted-foreground">Discrepancy: $245.67</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Needs Review</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Bank of America - Credit</p>
                      <p className="text-sm text-muted-foreground">Pending reconciliation</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Start Reconciliation</CardTitle>
              <CardDescription>
                Reconcile your bank statements with accounting records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-account">Bank Account</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chase-checking">Chase Bank - Checking</SelectItem>
                      <SelectItem value="wells-savings">Wells Fargo - Savings</SelectItem>
                      <SelectItem value="boa-credit">Bank of America - Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statement-date">Statement Date</Label>
                  <Input id="statement-date" type="date" className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-balance">Bank Statement Balance</Label>
                  <Input id="bank-balance" type="number" step="0.01" placeholder="0.00" className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="book-balance">Book Balance</Label>
                  <Input id="book-balance" type="number" step="0.01" placeholder="0.00" className="rounded-xl" />
                </div>
              </div>
              <Button className="w-full rounded-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Reconciliation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Reconciliation History</CardTitle>
              <CardDescription>
                View past reconciliation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Chase Bank Reconciliation</p>
                      <p className="text-sm text-muted-foreground">Dec 15, 2024 - $45,678.90</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Wells Fargo Reconciliation</p>
                      <p className="text-sm text-muted-foreground">Dec 10, 2024 - $78,889.99</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
