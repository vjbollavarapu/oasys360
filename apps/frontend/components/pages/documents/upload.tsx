"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings
} from "lucide-react"

export function DocumentUploadOverview() {
  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
          <p className="text-muted-foreground">
            Upload and process documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Uploaded Today</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-2">Documents</p>
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
                <p className="text-xs text-muted-foreground mt-2">Successful uploads</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-2">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45.2 MB</div>
                <p className="text-xs text-muted-foreground">Uploaded today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload documents for processing and storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Document Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="receipts">Receipts</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Processing Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="files">Select Files</Label>
                <Input id="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
              </div>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Queue</CardTitle>
              <CardDescription>
                Documents currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Invoice_2024_001.pdf</p>
                      <p className="text-sm text-muted-foreground">Processing... 75% complete</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Receipt_Store_123.jpg</p>
                      <p className="text-sm text-muted-foreground">Processing... 45% complete</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>
                Recent upload activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Contract_2024.docx</p>
                      <p className="text-sm text-muted-foreground">Uploaded 2 hours ago</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Report_2024.xlsx</p>
                      <p className="text-sm text-muted-foreground">Failed - File too large</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Failed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
