'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PatientForm } from '@/components/forms/patient-form'
import { Button } from '@/components/ui/button'

export default function NewPatientPage() {
  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Patient
            </h1>
            <p className="text-muted-foreground">
              Add a new patient record to the local cache.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/clinician/patients">Back to Patient List</Link>
          </Button>
        </div>
        <PatientForm />
      </div>
    </DashboardLayout>
  )
}
