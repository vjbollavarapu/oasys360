"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ReceivingOverview } from "@/components/pages/purchase/receiving"

export default function ReceivingPage() {
  return (
    <DashboardLayout>
      <ReceivingOverview />
    </DashboardLayout>
  )
}
