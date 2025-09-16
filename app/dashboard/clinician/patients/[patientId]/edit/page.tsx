'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PatientForm } from '@/components/forms/patient-form'
import { Button } from '@/components/ui/button'

export default function EditPatientPage() {
  const params = useParams()
  const { patientId } = params
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return

    const fetchPatient = async () => {
      try {
        setLoading(true)
        // We only need the patient resource itself for the form, not all related data
        const response = await fetch(`/api/clinician/patients/${patientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch patient data for editing')
        }
        const data = await response.json()
        setPatient(data.patient) // The API returns a complex object, we just need the patient part
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [patientId])

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Patient
            </h1>
            <p className="text-muted-foreground">
              Update the patient's record in the local cache.
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/clinician/patients/${patientId}`}>Back to Patient Details</Link>
          </Button>
        </div>

        {loading && <p>Loading patient data...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}
        {!loading && !error && patient && (
          <PatientForm patient={patient} isEditing={true} />
        )}
      </div>
    </DashboardLayout>
  )
}
