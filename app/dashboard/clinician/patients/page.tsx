'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PatientTable } from '@/components/resource-tables/patient-table'
import { Button } from '@/components/ui/button'

interface Patient {
  id: string
  name: { text: string }[]
  gender: string
  birthDate: string
}

export default function PatientManagementPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/clinician/patients')
        if (!response.ok) {
          throw new Error('Failed to fetch patients')
        }
        const data = await response.json()
        setPatients(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Viewing all patients from the cached bulk import.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/clinician/patients/new">New Patient</Link>
            </Button>
            <Button onClick={() => router.push('/dashboard/clinician')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {loading && <p>Loading patients...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {!loading && !error && (
          <PatientTable patients={{ data: patients, source: 'cache' }} />
        )}
      </div>
    </DashboardLayout>
  )
}
