"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { TenantManagementOverview } from "@/components/pages/admin/tenants"

export default function TenantManagementPage() {
  return (
    <DashboardLayout>
      <TenantManagementOverview />
    </DashboardLayout>
  )
}
