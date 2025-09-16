'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Define types for the data we expect to fetch
interface Patient {
  id: string
  name: {
    text: string
  }[]
  gender: string
  birthDate: string
}

interface Appointment {
  id: string
  description: string
  start: string
  participant: {
    actor: {
      display: string
    }
  }[]
}

interface Condition {
  id: string
  code: {
    text: string
  }
  subject: {
    display: string
  }
}

interface Medication {
  id: string
  medicationCodeableConcept: {
    text: string
  }
  subject: {
    display: string
  }
}

interface FHIREntry<T> {
  resource: T;
}

export default function ClinicianDashboardPage() {
  const [data, setData] = useState({
    patients: [] as Patient[],
    appointments: [] as Appointment[],
    conditions: [] as Condition[],
    medications: [] as Medication[],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [
          patientsRes,
          appointmentsRes,
          conditionsRes,
          medicationsRes,
        ] = await Promise.all([
          fetch('/api/clinician/patients'),
          fetch('/api/clinician/appointments'),
          fetch('/api/clinician/conditions'),
          fetch('/api/clinician/medications'),
        ])

        if (
          !patientsRes.ok ||
          !appointmentsRes.ok ||
          !conditionsRes.ok ||
          !medicationsRes.ok
        ) {
          throw new Error('Failed to fetch some data')
        }

        const patientsData = await patientsRes.json()
        const appointmentsData = await appointmentsRes.json()
        const conditionsData = await conditionsRes.json()
        const medicationsData = await medicationsRes.json()

        setData({
          patients: patientsData.entry?.map((e: FHIREntry<Patient>) => e.resource) || [],
          appointments:
            appointmentsData.entry?.map((e: FHIREntry<Appointment>) => e.resource) || [],
          conditions: conditionsData.entry?.map((e: FHIREntry<Condition>) => e.resource) || [],
          medications: medicationsData.entry?.map((e: FHIREntry<Medication>) => e.resource) || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
              Clinician Dashboard
            </h1>
            <p className="text-muted-foreground">
              An overview of patients, appointments, and clinical data.
            </p>
          </div>
        </div>

        {loading && <p>Loading data...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Birth Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.patients.slice(0, 5).map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.name?.[0]?.text || 'N/A'}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{formatDate(patient.birthDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.appointments.slice(0, 5).map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.description}</TableCell>
                        <TableCell>
                          {appointment.participant?.[0]?.actor.display}
                        </TableCell>
                        <TableCell>{formatDate(appointment.start)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Condition</TableHead>
                      <TableHead>Patient</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.conditions.slice(0, 5).map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell>{condition.code.text}</TableCell>
                        <TableCell>{condition.subject.display}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medication Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Patient</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.medications.slice(0, 5).map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell>
                          {medication.medicationCodeableConcept.text}
                        </TableCell>
                        <TableCell>{medication.subject.display}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
