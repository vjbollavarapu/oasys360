"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { PurchaseSettingsOverview } from "@/components/pages/purchase/settings"

export default function PurchaseSettingsPage() {
  return (
    <DashboardLayout>
      <PurchaseSettingsOverview />
    </DashboardLayout>
  )
}
