/**
 * Bank Reconciliation Page
 * Main page for bank reconciliation in accounting module
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankReconciliationOverview } from "@/components/pages/accounting/bank-reconciliation"

export default function BankReconciliationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankReconciliationOverview />
      </div>
    </DashboardLayout>
  )
}
