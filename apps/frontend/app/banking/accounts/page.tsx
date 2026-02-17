/**
 * Bank Accounts Page
 * Main page for managing bank accounts
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankAccountsOverview } from "@/components/pages/banking/accounts"

export default function BankAccountsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankAccountsOverview />
      </div>
    </DashboardLayout>
  )
}
