"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { FinancialForecastingOverview } from "@/components/pages/ai-processing/forecasting"

export default function FinancialForecastingPage() {
  return (
    <DashboardLayout>
      <FinancialForecastingOverview />
    </DashboardLayout>
  )
}
