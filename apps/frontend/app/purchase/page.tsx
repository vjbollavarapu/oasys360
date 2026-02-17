"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOverview } from "@/components/pages/purchase/overview"

export default function PurchasePage() {
  return (
    <DashboardLayout>
      <PurchaseOverview />
    </DashboardLayout>
  )
}
