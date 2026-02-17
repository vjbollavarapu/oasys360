"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { DeFiPositionsOverview } from "@/components/pages/web3/defi"

export default function DeFiPage() {
  return (
    <DashboardLayout>
      <DeFiPositionsOverview />
    </DashboardLayout>
  )
}
