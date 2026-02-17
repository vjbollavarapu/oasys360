/**
 * Fiscal Year Page
 * Main page for fiscal year management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { FiscalYearOverview } from "@/components/pages/accounting/fiscal-year"

export default function FiscalYearPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <FiscalYearOverview />
      </div>
    </DashboardLayout>
  )
}
