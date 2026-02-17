"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SystemSettingsOverview } from "@/components/pages/admin/settings"

export default function SystemSettingsPage() {
  return (
    <DashboardLayout>
      <SystemSettingsOverview />
    </DashboardLayout>
  )
}
