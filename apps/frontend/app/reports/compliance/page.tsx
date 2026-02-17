"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ComplianceReportsOverview } from "@/components/pages/reports/compliance"

export default function ComplianceReportsPage() {
  return (
    <DashboardLayout>
      <ComplianceReportsOverview />
    </DashboardLayout>
  )
}
