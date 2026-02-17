"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SmartContractsOverview } from "@/components/pages/web3/contracts"

export default function ContractsPage() {
  return (
    <DashboardLayout>
      <SmartContractsOverview />
    </DashboardLayout>
  )
}
