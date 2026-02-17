"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SalesAnalyticsOverview } from "@/components/pages/sales/analytics"

export default function SalesAnalyticsPage() {
  return (
    <DashboardLayout>
      <SalesAnalyticsOverview />
    </DashboardLayout>
  )
}
