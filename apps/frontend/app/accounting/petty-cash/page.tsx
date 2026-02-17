/**
 * Petty Cash Page
 * Main page for petty cash management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { PettyCashOverview } from "@/components/pages/accounting/petty-cash"

export default function PettyCashPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <PettyCashOverview />
      </div>
    </DashboardLayout>
  )
}

