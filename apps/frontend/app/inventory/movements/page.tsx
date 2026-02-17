/**
 * Stock Movements Page
 * Main page for managing inventory stock movements
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { StockMovementsOverview } from "@/components/pages/inventory/movements"

export default function StockMovementsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <StockMovementsOverview />
      </div>
    </DashboardLayout>
  )
}

