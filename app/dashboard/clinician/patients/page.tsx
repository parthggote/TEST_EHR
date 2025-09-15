"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react"
import { Patient } from "@/lib/types/fhir";
import { useToast } from "@/hooks/use-toast";

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
  const [searchParams, setSearchParams] = useState({ family: "", given: "" });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPatients([]);

    const query = new URLSearchParams({
      family: searchParams.family,
      given: searchParams.given,
    }).toString();

    try {
      const response = await fetch(`/api/clinician/patients?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch patients');
      }
      const data = await response.json();
      // The result from a search is a Bundle resource
      setPatients(data.entry?.map((entry: any) => entry.resource) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
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
                  placeholder="Family Name..."
                  value={searchParams.family}
                  onChange={(e) => setSearchParams({ ...searchParams, family: e.target.value })}
                />
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="Given Name..."
                  value={searchParams.given}
                  onChange={(e) => setSearchParams({ ...searchParams, given: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
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
