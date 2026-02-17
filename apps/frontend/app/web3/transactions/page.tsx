"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { CryptoTransactionsOverview } from "@/components/pages/web3/transactions"

export default function CryptoTransactionsPage() {
  return (
    <DashboardLayout>
      <CryptoTransactionsOverview />
    </DashboardLayout>
  )
}
