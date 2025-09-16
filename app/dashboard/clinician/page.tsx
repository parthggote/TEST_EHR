'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientTable } from '@/components/resource-tables/patient-table'
import { AppointmentTable } from '@/components/resource-tables/appointment-table'
import { ConditionTable } from '@/components/resource-tables/condition-table'
import { MedicationTable } from '@/components/resource-tables/medication-table'
import { AllergyTable } from '@/components/resource-tables/allergy-table'
import { PractitionerTable } from '@/components/resource-tables/practitioner-table'
import { DiagnosticReportTable } from '@/components/resource-tables/diagnostic-report-table'
import { ImmunizationTable } from '@/components/resource-tables/immunization-table'
import { ObservationTable } from '@/components/resource-tables/observation-table'
import { DocumentReferenceTable } from '@/components/resource-tables/document-reference-table'
import { ProcedureTable } from '@/components/resource-tables/procedure-table'

type BulkImportStatus =
  | 'idle'
  | 'starting'
  | 'in-progress'
  | 'complete'
  | 'fetching'
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
interface AllergyIntolerance {
  id: string
  code: { text: string }
  patient: { display: string }
}
interface Practitioner {
  id: string
  name: { text: string }[]
}
interface DiagnosticReport {
  id: string
  code: { text: string }
  subject: { display: string }
  conclusion: string
}
interface Immunization {
  id: string
  vaccineCode: { text: string }
  patient: { display: string }
  occurrenceDateTime: string
}
interface Observation {
  id: string
  code: { text: string }
  subject: { display: string }
  valueQuantity?: { value: number; unit: string }
  valueString?: string
}
interface DocumentReference {
  id: string
  description: string
  subject: { display: string }
  date: string
}
interface Procedure {
  id: string
  code: { text: string }
  subject: { display: string }
  performedDateTime: string
}

export default function ClinicianDashboardPage() {
  const [importStatus, setImportStatus] = useState<BulkImportStatus>('idle')
  const [statusUrl, setStatusUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedForManifest = useRef(false)

  // State for the fetched data
  const [patients, setPatients] = useState<{ data: Patient[]; source: string | null }>({ data: [], source: null })
  const [appointments, setAppointments] = useState<{ data: Appointment[]; source: string | null }>({ data: [], source: null })
  const [conditions, setConditions] = useState<{ data: Condition[]; source: string | null }>({ data: [], source: null })
  const [medications, setMedications] = useState<{ data: Medication[]; source: string | null }>({ data: [], source: null })
  const [allergies, setAllergies] = useState<{ data: AllergyIntolerance[]; source: string | null }>({ data: [], source: null })
  const [practitioners, setPractitioners] = useState<{ data: Practitioner[]; source: string | null }>({ data: [], source: null })
  const [diagnosticReports, setDiagnosticReports] = useState<{ data: DiagnosticReport[]; source: string | null }>({ data: [], source: null })
  const [immunizations, setImmunizations] = useState<{ data: Immunization[]; source: string | null }>({ data: [], source: null })
  const [observations, setObservations] = useState<{ data: Observation[]; source: string | null }>({ data: [], source: null })
  const [documentReferences, setDocumentReferences] = useState<{ data: DocumentReference[]; source: string | null }>({ data: [], source: null })
  const [procedures, setProcedures] = useState<{ data: Procedure[]; source: string | null }>({ data: [], source: null })

  const startBulkImport = async () => {
    setImportStatus('starting')
    setError(null)
    setManifest(null)
    hasFetchedForManifest.current = false
    // Reset all data states
    setPatients({ data: [], source: null })
    setAppointments({ data: [], source: null })
    setConditions({ data: [], source: null })
    setMedications({ data: [], source: null })
    setAllergies({ data: [], source: null })
    setPractitioners({ data: [], source: null })
    setDiagnosticReports({ data: [], source: null })
    setImmunizations({ data: [], source: null })
    setObservations({ data: [], source: null })
    setDocumentReferences({ data: [], source: null })
    setProcedures({ data: [], source: null })
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

  // Effect to automatically fetch all data when manifest is received
  useEffect(() => {
    // This effect should only run once per manifest
    if (!manifest || hasFetchedForManifest.current) {
      return
    }

    const fetchAllData = async () => {
      hasFetchedForManifest.current = true
      setImportStatus('fetching')
      setError(null)

      const promises = manifest.output.map((resource: any) => {
          return fetch('/api/clinician/bulk-data/fetch-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: resource.url }),
          })
          .then(res => {
            if (!res.ok) {
              console.error(`Failed to fetch ${resource.type}`)
              return null; // Return null on failure to not break Promise.all
            }
            return res.json().then(result => ({ type: resource.type, ...result }));
          })
        });

        const results = await Promise.all(promises);

        results.forEach(result => {
          if (!result) return; // Skip failed requests
          const { type, data, source } = result;
          switch (type) {
            case 'Patient': setPatients({ data, source }); break;
            case 'Appointment': setAppointments({ data, source }); break;
            case 'Condition': setConditions({ data, source }); break;
            case 'MedicationRequest': setMedications({ data, source }); break;
            case 'AllergyIntolerance': setAllergies({ data, source }); break;
            case 'Practitioner': setPractitioners({ data, source }); break;
            case 'DiagnosticReport': setDiagnosticReports({ data, source }); break;
            case 'Immunization': setImmunizations({ data, source }); break;
            case 'Observation': setObservations({ data, source }); break;
            case 'DocumentReference': setDocumentReferences({ data, source }); break;
            case 'Procedure': setProcedures({ data, source }); break;
            default: break;
          }
        });

        setImportStatus('complete'); // Or a new status like 'displayed'
      };

      fetchAllData();
    }
  }, [manifest]);

  // Effect for polling status
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    const checkStatus = async () => {
      if (!statusUrl) return
      try {
        const response = await fetch(
          `/api/clinician/bulk-data/status?url=${encodeURIComponent(statusUrl)}`
        )
        if (!response.ok) {
          throw new Error('Failed to check status')
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
    return () => clearInterval(intervalId)
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
              disabled={importStatus !== 'idle' && importStatus !== 'error'}
            >
              {
                {
                  'idle': 'Start Bulk Import',
                  'error': 'Retry Import',
                  'starting': 'Starting...',
                  'in-progress': `Importing... ${progress || ''}`,
                  'fetching': 'Fetching Data...',
                  'complete': 'Import Complete'
                }[importStatus]
              }
            </Button>

            {importStatus !== 'idle' && importStatus !== 'complete' && (
              <div className="pt-4">
                <h3 className="font-semibold">Import Status: {importStatus}</h3>
                {importStatus === 'error' && (
                  <p className="text-destructive">Error: {error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientTable patients={patients} />
          <AppointmentTable appointments={appointments} />
          <ConditionTable conditions={conditions} />
          <MedicationTable medications={medications} />
          <AllergyTable allergies={allergies} />
          <PractitionerTable practitioners={practitioners} />
          <DiagnosticReportTable reports={diagnosticReports} />
          <ImmunizationTable immunizations={immunizations} />
          <ObservationTable observations={observations} />
          <DocumentReferenceTable documents={documentReferences} />
          <ProcedureTable procedures={procedures} />
        </div>
      </div>
    </DashboardLayout>
  )
}
