"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { AIModelsOverview } from "@/components/pages/ai-processing/models"

export default function AIModelsPage() {
  return (
    <DashboardLayout>
      <AIModelsOverview />
    </DashboardLayout>
  )
}
