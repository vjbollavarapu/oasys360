/**
 * Invoice Templates Page
 * Main page for managing invoice templates
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InvoiceTemplatesOverview } from "@/components/pages/invoicing/templates"

export default function InvoiceTemplatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InvoiceTemplatesOverview />
      </div>
    </DashboardLayout>
  )
}
