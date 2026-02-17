"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ApprovalsOverview } from "@/components/pages/purchase/approvals"

export default function ApprovalsPage() {
  return (
    <DashboardLayout>
      <ApprovalsOverview />
    </DashboardLayout>
  )
}
