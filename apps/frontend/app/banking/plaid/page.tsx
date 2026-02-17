/**
 * Plaid Connect Page
 * Main page for Plaid bank connection
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaidConnectOverview } from "@/components/pages/banking/plaid"

export default function PlaidPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <PlaidConnectOverview />
      </div>
    </DashboardLayout>
  )
}
