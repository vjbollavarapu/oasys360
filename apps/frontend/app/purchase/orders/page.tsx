"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { PurchaseOrdersOverview } from "@/components/pages/purchase/orders"

export default function PurchaseOrdersPage() {
  return (
    <DashboardLayout>
      <PurchaseOrdersOverview />
    </DashboardLayout>
  )
}
