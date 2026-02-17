"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { TaxReportsOverview } from "@/components/pages/reports/tax"

export default function TaxReportsPage() {
  return (
    <DashboardLayout>
      <TaxReportsOverview />
    </DashboardLayout>
  )
}
