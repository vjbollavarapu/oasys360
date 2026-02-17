"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { BlockchainNetworksOverview } from "@/components/pages/web3/networks"

export default function NetworksPage() {
  return (
    <DashboardLayout>
      <BlockchainNetworksOverview />
    </DashboardLayout>
  )
}
