"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { CommissionTrackingOverview } from "@/components/pages/sales/commission"

export default function CommissionPage() {
  return (
    <DashboardLayout>
      <CommissionTrackingOverview />
    </DashboardLayout>
  )
}
