/**
 * Chart of Accounts (GL Accounts) Page
 * Main page for managing the chart of accounts
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { GLAccountsOverview } from "@/components/pages/accounting/gl-accounts"

export default function GLAccountsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <GLAccountsOverview />
      </div>
    </DashboardLayout>
  )
}
