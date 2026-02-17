"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { ContractManagementOverview } from "@/components/pages/purchase/contracts"

export default function ContractsPage() {
  return (
    <DashboardLayout>
      <ContractManagementOverview />
    </DashboardLayout>
  )
}
