'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PatientForm } from '@/components/forms/patient-form'
import { ArrowLeft } from 'lucide-react'

export default function NewPatientPage() {
  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/clinician/patients"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient Management
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Add New Patient</h1>
          <p className="text-muted-foreground">
            Enter the details for the new patient record.
          </p>
        </div>
        <PatientForm />
      </div>
    </DashboardLayout>
  )
}
