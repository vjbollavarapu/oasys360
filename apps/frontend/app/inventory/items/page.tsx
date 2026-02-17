/**
 * Inventory Items Page
 * Main page for managing inventory items
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryItemsOverview } from "@/components/pages/inventory/items"

export default function InventoryItemsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InventoryItemsOverview />
      </div>
    </DashboardLayout>
  )
}
