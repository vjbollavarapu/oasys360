"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { VendorsOverview } from "@/components/pages/purchase/vendors"

export default function VendorsPage() {
  return (
    <DashboardLayout>
      <VendorsOverview />
    </DashboardLayout>
  )
}
