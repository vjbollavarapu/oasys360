"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { SalesOrdersOverview } from "@/components/pages/sales/orders"

export default function SalesOrdersPage() {
  return (
    <DashboardLayout>
      <SalesOrdersOverview />
    </DashboardLayout>
  )
}
