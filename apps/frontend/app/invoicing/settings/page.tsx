/**
 * Invoicing Settings Page
 * Main page for invoicing configuration settings
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InvoicingSettingsOverview } from "@/components/pages/invoicing/settings"

export default function InvoicingSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InvoicingSettingsOverview />
      </div>
    </DashboardLayout>
  )
}
