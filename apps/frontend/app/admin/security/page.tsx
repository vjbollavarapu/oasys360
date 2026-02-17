"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SecurityOverview } from "@/components/pages/admin/security"

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <SecurityOverview />
    </DashboardLayout>
  )
}
