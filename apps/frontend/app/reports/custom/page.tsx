"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { CustomReportsOverview } from "@/components/pages/reports/custom"

export default function CustomReportsPage() {
  return (
    <DashboardLayout>
      <CustomReportsOverview />
    </DashboardLayout>
  )
}
