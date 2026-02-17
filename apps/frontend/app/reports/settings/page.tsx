"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ReportsSettingsOverview } from "@/components/pages/reports/settings"

export default function ReportsSettingsPage() {
  return (
    <DashboardLayout>
      <ReportsSettingsOverview />
    </DashboardLayout>
  )
}
