"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { DocumentTemplatesOverview } from "@/components/pages/documents/templates"

export default function DocumentTemplatesPage() {
  return (
    <DashboardLayout>
      <DocumentTemplatesOverview />
    </DashboardLayout>
  )
}
