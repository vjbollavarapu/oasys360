"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { FinancialReportsOverview } from "@/components/pages/reports/financial"

export default function FinancialReportsPage() {
  return (
    <DashboardLayout>
      <FinancialReportsOverview />
    </DashboardLayout>
  )
}
