"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { MobileSettingsOverview } from "@/components/pages/mobile/settings"

export default function MobileSettingsPage() {
  return (
    <DashboardLayout>
      <MobileSettingsOverview />
    </DashboardLayout>
  )
}
