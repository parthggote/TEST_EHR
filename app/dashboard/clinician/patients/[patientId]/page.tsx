'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { PatientTable } from '@/components/resource-tables/patient-table'
import { AppointmentTable } from '@/components/resource-tables/appointment-table'
import { ConditionTable } from '@/components/resource-tables/condition-table'
import { MedicationTable } from '@/components/resource-tables/medication-table'
import { AllergyTable } from '@/components/resource-tables/allergy-table'
import { ImmunizationTable } from '@/components/resource-tables/immunization-table'
import { DiagnosticReportTable } from '@/components/resource-tables/diagnostic-report-table'
import { ProcedureTable } from '@/components/resource-tables/procedure-table'

export default function PatientDetailPage() {
  const params = useParams()
  const { patientId } = params

  const [patientData, setPatientData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return

    const fetchPatientDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/clinician/patients/${patientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch patient details')
        }
        const data = await response.json()
        setPatientData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientDetails()
  }, [patientId])

  if (loading) return <DashboardLayout userType="clinician"><p>Loading patient details...</p></DashboardLayout>
  if (error) return <DashboardLayout userType="clinician"><p className="text-destructive">Error: {error}</p></DashboardLayout>
  if (!patientData) return <DashboardLayout userType="clinician"><p>No data found for this patient.</p></DashboardLayout>

  const { patient, appointments, conditions, medications, allergies, immunizations, diagnosticReports, procedures } = patientData

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {patient?.name?.[0]?.text || 'Patient Details'}
            </h1>
            <p className="text-muted-foreground">
              Viewing details for patient ID: {patientId}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/clinician/patients">Back to Patient List</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* The PatientTable expects an object with a 'data' array */}
          {patient && <PatientTable patients={{ data: [patient], source: 'cache' }} />}

          <AppointmentTable appointments={{ data: appointments || [], source: 'cache' }} />
          <ConditionTable conditions={{ data: conditions || [], source: 'cache' }} />
          <MedicationTable medications={{ data: medications || [], source: 'cache' }} />
          <AllergyTable allergies={{ data: allergies || [], source: 'cache' }} />
          <ImmunizationTable immunizations={{ data: immunizations || [], source: 'cache' }} />
          <DiagnosticReportTable reports={{ data: diagnosticReports || [], source: 'cache' }} />
          <ProcedureTable procedures={{ data: procedures || [], source: 'cache' }} />
        </div>
      </div>
    </DashboardLayout>
  )
}
