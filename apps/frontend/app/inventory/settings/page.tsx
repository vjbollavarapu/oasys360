/**
 * Inventory Settings Page
 * Main page for inventory configuration settings
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { InventorySettingsOverview } from "@/components/pages/inventory/settings"

export default function InventorySettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <InventorySettingsOverview />
      </div>
    </DashboardLayout>
  )
}
