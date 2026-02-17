/**
 * Inventory Valuation Page
 * Main page for inventory valuation management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryValuationOverview } from "@/components/pages/inventory/valuation"

export default function InventoryValuationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InventoryValuationOverview />
      </div>
    </DashboardLayout>
  )
}
