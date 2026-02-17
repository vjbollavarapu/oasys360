"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SalesSettingsOverview } from "@/components/pages/sales/settings"

export default function SalesSettingsPage() {
  return (
    <DashboardLayout>
      <SalesSettingsOverview />
    </DashboardLayout>
  )
}
