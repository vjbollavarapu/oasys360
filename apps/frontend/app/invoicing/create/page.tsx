/**
 * Create Invoice Page
 * Main page for creating new invoices
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateInvoiceForm } from "@/components/pages/invoicing/create-invoice"

export default function CreateInvoicePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <CreateInvoiceForm />
      </div>
    </DashboardLayout>
  )
}
