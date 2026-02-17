/**
 * Reorder Points Page
 * Main page for managing reorder points
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReorderPointsOverview } from "@/components/pages/inventory/reorder"

export default function ReorderPointsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <ReorderPointsOverview />
      </div>
    </DashboardLayout>
  )
}
