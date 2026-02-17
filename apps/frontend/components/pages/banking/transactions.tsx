"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Clock
} from "lucide-react"

export function BankTransactionsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Transactions</h1>
          <p className="text-muted-foreground">
            View and manage bank transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="rounded-full">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,678.90</div>
                <p className="text-xs text-muted-foreground mt-2">Net flow</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting clearance</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Categorized</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,235</div>
                <p className="text-xs text-muted-foreground mt-2">Auto-categorized</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest bank transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Salary Deposit</p>
                      <p className="text-sm text-muted-foreground">Dec 15, 2024 - Chase Bank</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+$5,000.00</p>
                    <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Income</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Grocery Store</p>
                      <p className="text-sm text-muted-foreground">Dec 14, 2024 - Wells Fargo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-$125.67</p>
                    <Badge className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Food</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">Online Purchase</p>
                      <p className="text-sm text-muted-foreground">Dec 13, 2024 - Pending</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-$89.99</p>
                    <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Pending</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and manage all bank transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Transaction list interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
              <CardDescription>
                Filter and search transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount-range">Amount Range</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">$0 - $100</SelectItem>
                      <SelectItem value="100-1000">$100 - $1,000</SelectItem>
                      <SelectItem value="1000-10000">$1,000 - $10,000</SelectItem>
                      <SelectItem value="10000+">$10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
