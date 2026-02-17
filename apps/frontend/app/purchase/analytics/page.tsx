"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { VendorAnalyticsOverview } from "@/components/pages/purchase/analytics"

export default function VendorAnalyticsPage() {
  return (
    <DashboardLayout>
      <VendorAnalyticsOverview />
    </DashboardLayout>
  )
}
