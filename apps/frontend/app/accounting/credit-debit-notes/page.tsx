/**
 * Credit/Debit Notes Page
 * Main page for credit and debit notes management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { CreditDebitNotesOverview } from "@/components/pages/accounting/credit-debit-notes"

export default function CreditDebitNotesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <CreditDebitNotesOverview />
      </div>
    </DashboardLayout>
  )
}
