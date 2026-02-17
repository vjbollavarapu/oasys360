/**
 * Accounting Settings Page
 * Main page for accounting settings
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { AccountingSettingsOverview } from "@/components/pages/accounting/settings"

export default function AccountingSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <AccountingSettingsOverview />
      </div>
    </DashboardLayout>
  )
}

