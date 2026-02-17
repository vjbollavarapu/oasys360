"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { AIProcessingSettingsOverview } from "@/components/pages/ai-processing/settings"

export default function AIProcessingSettingsPage() {
  return (
    <DashboardLayout>
      <AIProcessingSettingsOverview />
    </DashboardLayout>
  )
}
