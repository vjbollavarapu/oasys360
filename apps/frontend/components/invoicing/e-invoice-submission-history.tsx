/**
 * E-Invoice Submission History Component
 * Displays the history of all e-invoice submission attempts for an invoice
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";
import { invoicingService } from "@/lib/api-services";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface EInvoiceSubmission {
  id: string;
  invoice: string;
  invoice_number: string;
  submission_type: "submit" | "status_check" | "cancel";
  status: "pending" | "success" | "failed";
  request_payload?: any;
  response_payload?: any;
  qrid?: string | null;
  error_message?: string | null;
  error_code?: string | null;
  retry_count: number;
  submitted_at: string;
  completed_at?: string | null;
  created_by_name?: string;
}

interface EInvoiceSubmissionHistoryProps {
  invoiceId: string;
  className?: string;
}

export function EInvoiceSubmissionHistory({
  invoiceId,
  className = "",
}: EInvoiceSubmissionHistoryProps) {
  const { error, handleError, withErrorHandling } = useErrorHandler();
  const [submissions, setSubmissions] = useState<EInvoiceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<EInvoiceSubmission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const loadSubmissions = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await invoicingService.getEInvoiceSubmissions(invoiceId);
      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    if (invoiceId) {
      loadSubmissions();
    }
  }, [invoiceId]);

  const getSubmissionTypeLabel = (type: string) => {
    switch (type) {
      case "submit":
        return "Submit";
      case "status_check":
        return "Status Check";
      case "cancel":
        return "Cancel";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = async (submission: EInvoiceSubmission) => {
    try {
      const response = await invoicingService.getEInvoiceSubmissionDetail(submission.id);
      if (response.success && response.data) {
        setSelectedSubmission(response.data);
        setShowDetailDialog(true);
      } else {
        setSelectedSubmission(submission);
        setShowDetailDialog(true);
      }
    } catch (error) {
      setSelectedSubmission(submission);
      setShowDetailDialog(true);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                Track all e-invoice submission attempts and their status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadSubmissions}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No submission history found</p>
              <p className="text-sm">Submissions will appear here after you submit invoices to MyInvois</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QRID</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {getSubmissionTypeLabel(submission.submission_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.qrid ? (
                        <span className="font-mono text-sm">{submission.qrid}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(submission.submitted_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.completed_at ? (
                        <span className="text-sm">{formatDate(submission.completed_at)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {submission.created_by_name || "System"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(submission)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              View detailed information about this submission
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="font-medium">
                    {getSubmissionTypeLabel(selectedSubmission.submission_type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">QRID</label>
                  <p className="font-mono text-sm">
                    {selectedSubmission.qrid || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Retry Count</label>
                  <p className="font-medium">{selectedSubmission.retry_count}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                  <p className="text-sm">{formatDate(selectedSubmission.submitted_at)}</p>
                </div>
                {selectedSubmission.completed_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                    <p className="text-sm">{formatDate(selectedSubmission.completed_at)}</p>
                  </div>
                )}
              </div>

              {selectedSubmission.error_message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Error</div>
                    <p className="text-sm">{selectedSubmission.error_message}</p>
                    {selectedSubmission.error_code && (
                      <p className="text-xs mt-1">Code: {selectedSubmission.error_code}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {selectedSubmission.request_payload && Object.keys(selectedSubmission.request_payload).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Request Payload
                  </label>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedSubmission.request_payload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedSubmission.response_payload && Object.keys(selectedSubmission.response_payload).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Response Payload
                  </label>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedSubmission.response_payload, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

