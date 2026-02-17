"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { FraudDetectionOverview } from "@/components/pages/ai-processing/fraud"

export default function FraudDetectionPage() {
  return (
    <DashboardLayout>
      <FraudDetectionOverview />
    </DashboardLayout>
  )
}
