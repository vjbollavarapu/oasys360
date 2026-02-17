/**
 * Bank Transactions Page
 * Main page for managing bank transactions
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankTransactionsOverview } from "@/components/pages/banking/transactions"

export default function BankTransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankTransactionsOverview />
      </div>
    </DashboardLayout>
  )
}
