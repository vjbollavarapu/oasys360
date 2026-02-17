"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { AuditLogsOverview } from "@/components/pages/admin/audit"

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <AuditLogsOverview />
    </DashboardLayout>
  )
}
