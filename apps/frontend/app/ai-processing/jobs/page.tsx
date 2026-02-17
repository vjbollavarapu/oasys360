"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ProcessingJobsOverview } from "@/components/pages/ai-processing/jobs"

export default function ProcessingJobsPage() {
  return (
    <DashboardLayout>
      <ProcessingJobsOverview />
    </DashboardLayout>
  )
}
