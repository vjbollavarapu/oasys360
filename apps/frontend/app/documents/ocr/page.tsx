"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { OCRProcessingOverview } from "@/components/pages/documents/ocr"

export default function OCRProcessingPage() {
  return (
    <DashboardLayout>
      <OCRProcessingOverview />
    </DashboardLayout>
  )
}
