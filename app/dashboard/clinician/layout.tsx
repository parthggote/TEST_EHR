import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'EHR_Dashboard - Clinician',
}

export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
