"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { CryptoWalletsOverview } from "@/components/pages/web3/wallets"

export default function CryptoWalletsPage() {
  return (
    <DashboardLayout>
      <CryptoWalletsOverview />
    </DashboardLayout>
  )
}
