"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react"
import { Patient } from "@/lib/types/fhir";

// Helper to get a patient's full name from the FHIR resource
function getPatientName(patient: Patient): string {
  if (!patient.name || patient.name.length === 0) {
    return "Unknown";
  }
  const officialName = patient.name.find(n => n.use === 'official') || patient.name[0];
  const given = officialName.given?.join(' ') || '';
  const family = officialName.family || '';
  return `${given} ${family}`.trim();
}

export default function ClinicianPatientsPage() {
  const [searchParams, setSearchParams] = useState({ identifier: "", family: "", given: "" });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadAllPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clinician/patients?_fetchAll=true');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch all patients');
      }
      const data = await response.json();
      setPatients(data.entry?.map((entry: any) => entry.resource) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllPatients();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPatients([]);

    const query = new URLSearchParams({
      identifier: searchParams.identifier,
      family: searchParams.family,
      given: searchParams.given,
    }).toString();

    try {
      const response = await fetch(`/api/clinician/patients?${query}`);

      // The response from the FHIR server will be proxied through our API.
      // We need to check the status here and get the detailed error if it's not ok.
      if (!response.ok) {
        const errorData = await response.json();
        // The 'details' field from our backend contains the actual error from the FHIR server
        throw new Error(errorData.details || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setPatients(data.entry?.map((entry: any) => entry.resource) || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    if (isLoading) return;
    setSearchParams({ identifier: "", family: "", given: "" });
    loadAllPatients();
  };

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
            <p className="text-muted-foreground">Search, view, and manage patient records.</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => router.push('/dashboard/clinician/patients/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Patient Identifier (MRN, SSN)..."
                  value={searchParams.identifier}
                  onChange={(e) => setSearchParams({ ...searchParams, identifier: e.target.value })}
                  required
                />
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="Family Name (Optional)..."
                  value={searchParams.family}
                  onChange={(e) => setSearchParams({ ...searchParams, family: e.target.value })}
                />
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="Given Name (Optional)..."
                  value={searchParams.given}
                  onChange={(e) => setSearchParams({ ...searchParams, given: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleClearSearch} disabled={isLoading}>
                Clear
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient List ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Fetching Patients</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
                </AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Patient ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="w-6 h-6 mx-auto my-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      onClick={() => router.push(`/dashboard/clinician/patients/${patient.id}`)}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">{getPatientName(patient)}</TableCell>
                      <TableCell>{patient.birthDate}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell className="font-mono">{patient.id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!isLoading && patients.length === 0 && !error && (
              <p className="text-center text-muted-foreground py-8">No patients found. Try a different search.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
