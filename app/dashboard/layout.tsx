import type { Metadata } from 'next'
import type React from "react"

export const metadata: Metadata = {
  title: 'EHR_Dashboard - Patient',
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
