/**
 * Banking Settings Page
 * Main page for banking configuration settings
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankingSettingsOverview } from "@/components/pages/banking/settings"

export default function BankingSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankingSettingsOverview />
      </div>
    </DashboardLayout>
  )
}
