"use client"

import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  AlertCircle,
  Loader2 
} from "lucide-react"

export type EInvoiceStatus = "pending" | "submitted" | "accepted" | "rejected" | "cancelled" | null | undefined

interface EInvoiceStatusBadgeProps {
  status: EInvoiceStatus
  className?: string
}

export function EInvoiceStatusBadge({ status, className = "" }: EInvoiceStatusBadgeProps) {
  if (!status) {
    return null
  }

  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    submitted: {
      label: "Submitted",
      variant: "default" as const,
      icon: Send,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    accepted: {
      label: "Accepted",
      variant: "default" as const,
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    cancelled: {
      label: "Cancelled",
      variant: "secondary" as const,
      icon: AlertCircle,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  }

  const config = statusConfig[status]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

interface EInvoiceStatusDisplayProps {
  status: EInvoiceStatus
  qrid?: string | null
  submittedAt?: string | null
  validatedAt?: string | null
  errors?: string[] | null
}

export function EInvoiceStatusDisplay({
  status,
  qrid,
  submittedAt,
  validatedAt,
  errors,
}: EInvoiceStatusDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">E-Invoice Status:</span>
        <EInvoiceStatusBadge status={status} />
      </div>

      {qrid && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">QRID:</span> {qrid}
        </div>
      )}

      {submittedAt && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Submitted:</span>{" "}
          {new Date(submittedAt).toLocaleString()}
        </div>
      )}

      {validatedAt && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Validated:</span>{" "}
          {new Date(validatedAt).toLocaleString()}
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <div
              key={index}
              className="text-sm text-destructive bg-red-50 p-2 rounded"
            >
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

