"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SalesPipelineOverview } from "@/components/pages/sales/pipeline"

export default function SalesPipelinePage() {
  return (
    <DashboardLayout>
      <SalesPipelineOverview />
    </DashboardLayout>
  )
}
