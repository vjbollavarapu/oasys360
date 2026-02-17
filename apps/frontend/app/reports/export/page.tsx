"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ExportOptionsOverview } from "@/components/pages/reports/export"

export default function ExportOptionsPage() {
  return (
    <DashboardLayout>
      <ExportOptionsOverview />
    </DashboardLayout>
  )
}
