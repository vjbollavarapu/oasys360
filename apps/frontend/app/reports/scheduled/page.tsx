"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ScheduledReportsOverview } from "@/components/pages/reports/scheduled"

export default function ScheduledReportsPage() {
  return (
    <DashboardLayout>
      <ScheduledReportsOverview />
    </DashboardLayout>
  )
}
