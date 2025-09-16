'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientTable } from '@/components/resource-tables/patient-table'
import { AppointmentTable } from '@/components/resource-tables/appointment-table'
import { ConditionTable } from '@/components/resource-tables/condition-table'
import { MedicationTable } from '@/components/resource-tables/medication-table'

type BulkImportStatus =
  | 'idle'
  | 'starting'
  | 'in-progress'
  | 'complete'
  | 'error'

// Define types for the data we expect to fetch
interface Patient {
  id: string
  name: { text: string }[]
  gender: string
  birthDate: string
}

interface Appointment {
  id: string
  description: string
  start: string
  participant: { actor: { display: string } }[]
}

interface Condition {
  id: string
  code: { text: string }
  subject: { display: string }
}

interface Medication {
  id: string
  medicationCodeableConcept: { text: string }
  subject: { display: string }
}

export default function ClinicianDashboardPage() {
  const [importStatus, setImportStatus] = useState<BulkImportStatus>('idle')
  const [statusUrl, setStatusUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFetchingData, setIsFetchingData] = useState(false)

  // State for the fetched data
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

  const startBulkImport = async () => {
    setImportStatus('starting')
    setError(null)
    setManifest(null)
    setPatients([])
    setAppointments([])
    setConditions([])
    setMedications([])
    try {
      const response = await fetch('/api/clinician/bulk-data/start', {
        method: 'POST',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to start bulk import')
      }
      const { statusUrl } = await response.json()
      setStatusUrl(statusUrl)
      setImportStatus('in-progress')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setImportStatus('error')
    }
  }

  const fetchResourceData = async (resourceType: string) => {
    if (!manifest) return
    const resourceEntry = manifest.output.find(
      (o: any) => o.type === resourceType
    )
    if (!resourceEntry) {
      setError(`No ${resourceType} data found in the export manifest.`)
      return
    }

    setIsFetchingData(true)
    setError(null)
    try {
      const response = await fetch('/api/clinician/bulk-data/fetch-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: resourceEntry.url }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || `Failed to fetch ${resourceType} data`)
      }
      const data = await response.json()

      switch (resourceType) {
        case 'Patient':
          setPatients(data)
          break
        case 'Appointment':
          setAppointments(data)
          break
        case 'Condition':
          setConditions(data)
          break
        case 'MedicationRequest':
          setMedications(data)
          break
        default:
          console.warn(`No display logic for resource type: ${resourceType}`)
          setError(`Display logic for ${resourceType} is not implemented.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsFetchingData(false)
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      if (!statusUrl) return

      try {
        const response = await fetch(
          `/api/clinician/bulk-data/status?url=${encodeURIComponent(statusUrl)}`
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to check status')
        }

        const data = await response.json()

        if (response.headers.get('X-Progress')) {
          setProgress(response.headers.get('X-Progress'))
        }

        if (data.status === 'complete') {
          setManifest(data.manifest)
          setImportStatus('complete')
          setStatusUrl(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setImportStatus('error')
        setStatusUrl(null)
      }
    }

    if (importStatus === 'in-progress' && statusUrl) {
      intervalId = setInterval(checkStatus, 5000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [importStatus, statusUrl])

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bulk Data Management
            </h1>
            <p className="text-muted-foreground">
              Import and manage data for all patients in the test group.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Patient Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Click the button below to start the bulk import process for all
              test patients in the group.
            </p>
            <Button
              onClick={startBulkImport}
              disabled={importStatus === 'starting' || importStatus === 'in-progress'}
            >
              {importStatus === 'in-progress'
                ? 'Importing...'
                : 'Start Bulk Import'}
            </Button>

            {importStatus !== 'idle' && (
              <div className="pt-4">
                <h3 className="font-semibold">Import Status:</h3>
                <p>
                  Current Status:{' '}
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {importStatus}
                  </span>
                </p>
                {importStatus === 'in-progress' && progress && (
                  <p>Progress: {progress}</p>
                )}
                {importStatus === 'error' && (
                  <p className="text-destructive">Error: {error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {importStatus === 'complete' && manifest && (
          <Card>
            <CardHeader>
              <CardTitle>Exported Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Import is complete. You can now load the data for each
                resource type.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {manifest.output.map((o: any) => (
                  <Button
                    key={o.type}
                    variant="outline"
                    onClick={() => fetchResourceData(o.type)}
                    disabled={isFetchingData}
                  >
                    Load {o.type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientTable patients={patients} />
          <AppointmentTable appointments={appointments} />
          <ConditionTable conditions={conditions} />
          <MedicationTable medications={medications} />
        </div>
      </div>
    </DashboardLayout>
  )
}
