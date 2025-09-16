"use client"

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Patient } from "@/lib/types/fhir";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    given: "",
    family: "",
    birthDate: "",
    gender: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Construct a basic FHIR Patient resource
    const patientResource: Partial<Patient> = {
      resourceType: "Patient",
      name: [
        {
          use: "official",
          family: formData.family,
          given: [formData.given],
        },
      ],
      birthDate: formData.birthDate,
      gender: formData.gender as "male" | "female" | "other" | "unknown",
    };

    try {
      const response = await fetch('/api/clinician/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientResource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to create patient");
      }

      const newPatient = await response.json();

      toast({
        title: "Success!",
        description: `Patient ${formData.given} ${formData.family} has been created with ID: ${newPatient.id}`,
      });

      // Redirect to the patient management page
      router.push('/dashboard/clinician/patients');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/clinician/patients" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patient Management
            </>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Add New Patient</h1>
          <p className="text-muted-foreground">Enter the details for the new patient record.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="given-name">Given Name</Label>
                  <Input
                    id="given-name"
                    value={formData.given}
                    onChange={(e) => setFormData({ ...formData, given: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    required
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

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Patient"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
