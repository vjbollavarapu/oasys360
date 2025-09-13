"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/ui/document-upload"
import { useOrganization } from "@/hooks/use-organization"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, FileText, AlertTriangle } from "lucide-react"

interface PettyCashFormProps {
  isOpen: boolean
  onClose: () => void
}

export function PettyCashForm({ isOpen, onClose }: PettyCashFormProps) {
  const { canAddTransaction } = useOrganization()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)

  const dateValidation = canAddTransaction(selectedDate)

  const handleFileUpload = (files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create Petty Cash Transaction</DialogTitle>
          <DialogDescription>
            Record a new petty cash transaction with complete details
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-4">
            {/* Date validation alert */}
            {!dateValidation.allowed && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {dateValidation.reason}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account">Petty Cash Account</Label>
                <Select>
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-petty-cash">Office Petty Cash</SelectItem>
                    <SelectItem value="warehouse-petty-cash">Warehouse Petty Cash</SelectItem>
                    <SelectItem value="travel-petty-cash">Travel Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={!dateValidation.allowed ? "border-red-300 bg-red-50" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                    <SelectItem value="replenishment">Replenishment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" step="0.01" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description of transaction..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-supplies">Office Supplies</SelectItem>
                    <SelectItem value="travel">Travel & Transportation</SelectItem>
                    <SelectItem value="meals">Meals & Entertainment</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="receipt-number">Receipt Number</Label>
                <Input id="receipt-number" placeholder="Receipt/Reference number" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approver">Approved By</Label>
                <Select>
                  <SelectTrigger id="approver">
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Department Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="finance">Finance Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Petty Cash Card</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes or comments..." rows={3} />
            </div>

            {/* File attachment section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="enable-upload" checked={showFileUpload} onCheckedChange={setShowFileUpload} />
                <Label htmlFor="enable-upload">Attach files (receipts, invoices, etc.)</Label>
              </div>

              {showFileUpload && (
                <div className="space-y-4">
                                     <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                     <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                     <p className="text-sm text-blue-700">Drag & drop files here or click to browse</p>
                     <p className="text-xs text-blue-600 mt-1">PDF, JPG, PNG, DOC, XLS (max 10MB each)</p>
                   </div>
                   
                   {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Attached Files</Label>
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={!dateValidation.allowed}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 