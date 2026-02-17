/**
 * Inventory Categories Page
 * Main page for managing inventory categories
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryCategoriesOverview } from "@/components/pages/inventory/categories"

export default function InventoryCategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InventoryCategoriesOverview />
      </div>
    </DashboardLayout>
  )
}
