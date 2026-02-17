/**
 * Tax Management Page
 * Main page for tax configuration and management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { TaxManagementOverview } from "@/components/pages/invoicing/tax"

export default function TaxPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <TaxManagementOverview />
      </div>
    </DashboardLayout>
  )
}
