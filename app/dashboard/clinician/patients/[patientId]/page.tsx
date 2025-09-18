"use client"

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Pencil, Save } from "lucide-react";
import { Patient } from "@/lib/types/fhir";

// Helper to get a patient's full name from the FHIR resource
function getPatientName(patient: Patient | null): string {
  if (!patient?.name?.length) return "Unknown";
  const officialName = patient.name.find(n => n.use === 'official') || patient.name[0];
  return `${officialName.given?.join(' ') || ''} ${officialName.family || ''}`.trim();
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/clinician/patients/${patientId}`);
          if (!response.ok) throw new Error("Failed to fetch patient data.");
          const data: Patient = await response.json();
          setPatient(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinician/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update patient.");
      }

      const updatedPatient = await response.json();
      setPatient(updatedPatient);
      setIsEditing(false);
      toast({ title: "Success!", description: "Patient details updated." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!patient) return;

    if (window.confirm(`Are you sure you want to delete patient ${getPatientName(patient)}? This action cannot be undone.`)) {
      setIsSaving(true); // Reuse isSaving state for delete operation
      setError(null);

      try {
        const response = await fetch(`/api/clinician/patients/${patientId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to delete patient.");
        }

        toast({ title: "Success!", description: "Patient has been deleted." });
        router.push('/dashboard/clinician/patients');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="clinician">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="clinician">
        <p className="text-red-500">{error}</p>
      </DashboardLayout>
    );
  }

  if (!patient) return null;

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/clinician/patients" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient Management
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{getPatientName(patient)}</h1>
              <p className="text-muted-foreground">Patient ID: {patient.id}</p>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/50 hover:text-red-300" onClick={handleDelete}>
                  Delete
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Patient
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>
              {isEditing ? "Modify the patient's details below." : "View the patient's details below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="given-name">Given Name</Label>
                  <Input
                    id="given-name"
                    value={patient.name?.[0]?.given?.join(' ') || ''}
                    onChange={(e) => {
                      const newPatient = { ...patient };
                      if (!newPatient.name) newPatient.name = [];
                      if (!newPatient.name[0]) newPatient.name[0] = {};
                      newPatient.name[0].given = e.target.value.split(' ');
                      setPatient(newPatient as Patient);
                    }}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    value={patient.name?.[0]?.family || ''}
                    onChange={(e) => {
                      const newPatient = { ...patient };
                      if (!newPatient.name) newPatient.name = [];
                      if (!newPatient.name[0]) newPatient.name[0] = {};
                      newPatient.name[0].family = e.target.value;
                      setPatient(newPatient as Patient);
                    }}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={patient.birthDate || ''}
                    onChange={(e) => setPatient({ ...patient, birthDate: e.target.value } as Patient)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={patient.gender}
                    onValueChange={(value) => setPatient({ ...patient, gender: value } as Patient)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
