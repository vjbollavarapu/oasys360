"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { Web3SettingsOverview } from "@/components/pages/web3/settings"

export default function Web3SettingsPage() {
  return (
    <DashboardLayout>
      <Web3SettingsOverview />
    </DashboardLayout>
  )
}
