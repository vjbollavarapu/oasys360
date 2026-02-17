"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DocumentsOverview } from "@/components/pages/documents/overview"

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <DocumentsOverview />
    </DashboardLayout>
  )
}
