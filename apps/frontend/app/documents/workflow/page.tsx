"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { DocumentWorkflowOverview } from "@/components/pages/documents/workflow"

export default function DocumentWorkflowPage() {
  return (
    <DashboardLayout>
      <DocumentWorkflowOverview />
    </DashboardLayout>
  )
}
