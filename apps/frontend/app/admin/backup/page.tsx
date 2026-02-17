"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { BackupRestoreOverview } from "@/components/pages/admin/backup"

export default function BackupRestorePage() {
  return (
    <DashboardLayout>
      <BackupRestoreOverview />
    </DashboardLayout>
  )
}
