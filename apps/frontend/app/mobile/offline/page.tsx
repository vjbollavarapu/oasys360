"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { OfflineModeOverview } from "@/components/pages/mobile/offline"

export default function OfflineModePage() {
  return (
    <DashboardLayout>
      <OfflineModeOverview />
    </DashboardLayout>
  )
}
