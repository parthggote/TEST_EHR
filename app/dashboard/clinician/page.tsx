/**
 * Clinician Dashboard - Main Page
 * This will be the landing page for authenticated clinicians.
 */

import { DashboardLayout } from '@/components/dashboard-layout';

export default function ClinicianDashboardPage() {
  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clinician Portal</h1>
            <p className="text-muted-foreground">
              Welcome to the secure clinician dashboard.
            </p>
          </div>
        </div>

        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Clinician-specific components and data will be displayed here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
