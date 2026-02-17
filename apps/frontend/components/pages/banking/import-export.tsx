"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Download,
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export function ImportExportOverview() {
  return <BankImportExportOverview />;
}

export function BankImportExportOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import/Export</h1>
          <p className="text-muted-foreground">
            Import and export banking data and transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="rounded-full">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Imported Files</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.5%</div>
                <p className="text-xs text-muted-foreground mt-2">Successful imports</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground mt-2">Imported this month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <p className="text-xs text-muted-foreground mt-2">Need attention</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Import Banking Data</CardTitle>
              <CardDescription>
                Upload bank statements and transaction files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file-format">File Format</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="qif">QIF</SelectItem>
                      <SelectItem value="ofx">OFX</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bank">Bank</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chase">Chase Bank</SelectItem>
                      <SelectItem value="wells-fargo">Wells Fargo</SelectItem>
                      <SelectItem value="bank-of-america">Bank of America</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" accept=".csv,.qif,.ofx,.pdf" className="rounded-xl" />
              </div>
              <Button className="w-full rounded-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Transactions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Export Banking Data</CardTitle>
              <CardDescription>
                Export transactions and account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-30">Last 30 days</SelectItem>
                      <SelectItem value="last-90">Last 90 days</SelectItem>
                      <SelectItem value="this-year">This year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Import/Export History</CardTitle>
              <CardDescription>
                View recent import and export activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Chase Bank Statement Import</p>
                      <p className="text-sm text-muted-foreground">CSV file - 45 transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                    <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Success</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <Download className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Transaction Export</p>
                      <p className="text-sm text-muted-foreground">Excel file - Q1 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                    <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
