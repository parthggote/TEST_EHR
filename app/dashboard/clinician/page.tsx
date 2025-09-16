'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
        case 'MedicationRequest': // Note: The type in manifest might be MedicationRequest
          setMedications(data)
          break
        default:
          console.warn(`No display logic for resource type: ${resourceType}`)
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

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

        {patients.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Patients</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Gender</TableHead><TableHead>Birth Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {patients.map((item) => (
                    <TableRow key={item.id}><TableCell>{item.name?.[0]?.text || 'N/A'}</TableCell><TableCell>{item.gender}</TableCell><TableCell>{formatDate(item.birthDate)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {appointments.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Patient</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {appointments.map((item) => (
                    <TableRow key={item.id}><TableCell>{item.description}</TableCell><TableCell>{item.participant?.[0]?.actor.display}</TableCell><TableCell>{formatDate(item.start)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {conditions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Conditions</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Condition</TableHead><TableHead>Patient</TableHead></TableRow></TableHeader>
                <TableBody>
                  {conditions.map((item) => (
                    <TableRow key={item.id}><TableCell>{item.code.text}</TableCell><TableCell>{item.subject.display}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {medications.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Medication Requests</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Medication</TableHead><TableHead>Patient</TableHead></TableRow></TableHeader>
                <TableBody>
                  {medications.map((item) => (
                    <TableRow key={item.id}><TableCell>{item.medicationCodeableConcept.text}</TableCell><TableCell>{item.subject.display}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
