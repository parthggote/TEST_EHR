"use client"

import { useState, FormEvent } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Appointment } from "@/lib/types/fhir";

export default function ClinicianAppointmentsPage() {
  const [patientId, setPatientId] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError("Patient ID is required to search for appointments.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAppointments([]);

    try {
      const response = await fetch(`/api/clinician/appointments?patient=${patientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data.entry?.map((entry: any) => entry.resource) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointment Management</h1>
            <p className="text-muted-foreground">Search and manage patient appointments.</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter Patient ID to find appointments..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Find Appointments
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Results ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loader2 className="w-6 h-6 mx-auto my-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-mono">{appt.id}</TableCell>
                      <TableCell>{appt.status}</TableCell>
                      <TableCell>{appt.description}</TableCell>
                      <TableCell>{new Date(appt.start).toLocaleString()}</TableCell>
                      <TableCell>{new Date(appt.end).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" disabled>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!isLoading && appointments.length === 0 && !error && (
              <p className="text-center text-muted-foreground py-8">No appointments found for this patient.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
