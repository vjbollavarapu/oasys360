/**
 * Inventory Page
 * Main inventory module dashboard
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryOverview } from "@/components/pages/inventory/overview"

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InventoryOverview />
      </div>
    </DashboardLayout>
  )
}
