/**
 * E-Invoicing Page
 * Main page for LHDN e-invoicing setup and management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { EInvoicingSetup } from "@/components/pages/invoicing/e-invoicing"

export default function EInvoicingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <EInvoicingSetup />
      </div>
    </DashboardLayout>
  )
}
