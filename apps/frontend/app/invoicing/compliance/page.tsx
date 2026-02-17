/**
 * Compliance Rules Page
 * Main page for invoicing compliance management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { ComplianceRulesOverview } from "@/components/pages/invoicing/compliance"

export default function CompliancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <ComplianceRulesOverview />
      </div>
    </DashboardLayout>
  )
}
