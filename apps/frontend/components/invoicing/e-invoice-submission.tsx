"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { invoicingService } from "@/lib/api-services"
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  XCircle,
  RefreshCw
} from "lucide-react"
import { EInvoiceStatusBadge, EInvoiceStatus } from "./e-invoice-status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EInvoiceSubmissionProps {
  invoiceId: string
  currentStatus?: EInvoiceStatus
  qrid?: string | null
  onStatusUpdate?: () => void
  className?: string
}

export function EInvoiceSubmission({
  invoiceId,
  currentStatus,
  qrid,
  onStatusUpdate,
  className = "",
}: EInvoiceSubmissionProps) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [showUBLPreview, setShowUBLPreview] = useState(false)
  const [ublData, setUblData] = useState<any>(null)
  const [loadingUBL, setLoadingUBL] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      const response = await invoicingService.submitEInvoice(invoiceId)
      
      if (response.data) {
        toast({
          title: "Success",
          description: response.data.message || "Invoice submitted to MyInvois successfully",
        })
        
        if (onStatusUpdate) {
          onStatusUpdate()
        }
      }
    } catch (error: any) {
      console.error("Error submitting e-invoice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit invoice to MyInvois",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true)
      
      const response = await invoicingService.getEInvoiceStatus(invoiceId)
      
      if (response.data) {
        toast({
          title: "Status Updated",
          description: `Status: ${response.data.status || "Unknown"}`,
        })
        
        if (onStatusUpdate) {
          onStatusUpdate()
        }
      }
    } catch (error: any) {
      console.error("Error checking status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to check invoice status",
        variant: "destructive",
      })
    } finally {
      setCheckingStatus(false)
    }
  }

  const handlePreviewUBL = async () => {
    try {
      setLoadingUBL(true)
      const response = await invoicingService.generateUBLFormat(invoiceId)
      
      if (response.data) {
        setUblData(response.data.ubl_data)
        setShowUBLPreview(true)
        
        if (response.data.errors && response.data.errors.length > 0) {
          toast({
            title: "Validation Errors",
            description: "UBL format has validation errors. Please check the preview.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Error generating UBL:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate UBL format",
        variant: "destructive",
      })
    } finally {
      setLoadingUBL(false)
    }
  }

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive",
      })
      return
    }

    try {
      setCancelling(true)
      
      const response = await invoicingService.cancelEInvoice(invoiceId, cancellationReason)
      
      if (response.data) {
        toast({
          title: "Success",
          description: response.data.message || "Invoice cancelled successfully",
        })
        
        setShowCancelDialog(false)
        setCancellationReason("")
        
        if (onStatusUpdate) {
          onStatusUpdate()
        }
      }
    } catch (error: any) {
      console.error("Error cancelling e-invoice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invoice",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const canSubmit = !currentStatus || currentStatus === "pending" || currentStatus === "rejected"
  const canCancel = currentStatus === "submitted" || currentStatus === "accepted"
  const isAccepted = currentStatus === "accepted"

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>LHDN E-Invoicing</CardTitle>
          <CardDescription>
            Submit invoice to MyInvois for LHDN compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {currentStatus && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <span className="text-sm font-medium">Current Status:</span>
              </div>
              <EInvoiceStatusBadge status={currentStatus} />
            </div>
          )}

          {/* QRID Display */}
          {qrid && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">LHDN Reference Number (QRID):</div>
                <div className="font-mono text-sm mt-1">{qrid}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {isAccepted && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Invoice has been accepted by LHDN and is compliant.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canSubmit && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit to MyInvois
                  </>
                )}
              </Button>
            )}

            {currentStatus && (
              <Button
                variant="outline"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="flex items-center gap-2"
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Check Status
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handlePreviewUBL}
              disabled={loadingUBL}
              className="flex items-center gap-2"
            >
              {loadingUBL ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview UBL
                </>
              )}
            </Button>

            {canCancel && (
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel E-Invoice</DialogTitle>
                    <DialogDescription>
                      This will cancel the invoice in MyInvois. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cancellation_reason">
                        Cancellation Reason <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="cancellation_reason"
                        placeholder="Enter reason for cancellation..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCancelDialog(false)
                        setCancellationReason("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelling || !cancellationReason.trim()}
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Confirm Cancellation"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UBL Preview Dialog */}
      <Dialog open={showUBLPreview} onOpenChange={setShowUBLPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>UBL 2.1 Format Preview</DialogTitle>
            <DialogDescription>
              Preview of the UBL format that will be submitted to MyInvois
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {ublData && (
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(ublData, null, 2)}
              </pre>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUBLPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

