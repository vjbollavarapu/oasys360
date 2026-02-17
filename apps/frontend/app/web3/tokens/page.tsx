"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { TokenManagementOverview } from "@/components/pages/web3/tokens"

export default function TokensPage() {
  return (
    <DashboardLayout>
      <TokenManagementOverview />
    </DashboardLayout>
  )
}
