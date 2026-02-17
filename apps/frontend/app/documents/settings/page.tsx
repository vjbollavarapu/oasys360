"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { DocumentSettingsOverview } from "@/components/pages/documents/settings"

export default function DocumentSettingsPage() {
  return (
    <DashboardLayout>
      <DocumentSettingsOverview />
    </DashboardLayout>
  )
}
