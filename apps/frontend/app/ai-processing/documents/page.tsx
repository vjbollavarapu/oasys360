"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { DocumentProcessingOverview } from "@/components/pages/ai-processing/documents"

export default function DocumentProcessingPage() {
  return (
    <DashboardLayout>
      <DocumentProcessingOverview />
    </DashboardLayout>
  )
}
