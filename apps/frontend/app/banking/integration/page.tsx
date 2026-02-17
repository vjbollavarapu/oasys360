/**
 * Bank Integration Page
 * Main page for bank integrations
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankIntegrationOverview } from "@/components/pages/banking/integration"

export default function BankIntegrationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankIntegrationOverview />
      </div>
    </DashboardLayout>
  )
}
