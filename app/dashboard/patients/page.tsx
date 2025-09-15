"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Eye, Phone, Mail, MapPin } from "lucide-react"
import { Patient, FHIRBundle, AllergyIntolerance, MedicationRequest, Condition } from "@/lib/types/fhir"

interface PatientData extends Patient {
  allergies: AllergyIntolerance[];
  medications: MedicationRequest[];
  conditions: Condition[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/fhir/patients")
        if (!response.ok) {
          throw new Error("Failed to fetch patients")
        }
        const data: FHIRBundle<Patient> = await response.json()
        setPatients(data.entry?.map(e => e.resource) || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const handleSelectPatient = async (patient: Patient) => {
    setLoadingDetails(true)
    setSelectedPatient({ ...patient, allergies: [], medications: [], conditions: [] }) // Show basic info immediately
    try {
      const [allergiesRes, medicationsRes, conditionsRes] = await Promise.all([
        fetch(`/api/fhir/allergies?patient=${patient.id}`),
        fetch(`/api/fhir/medications?patient=${patient.id}`),
        fetch(`/api/fhir/conditions?patient=${patient.id}`),
      ])

      const allergies = await allergiesRes.json()
      const medications = await medicationsRes.json()
      const conditions = await conditionsRes.json()

      setSelectedPatient({
        ...patient,
        allergies: allergies.entry?.map((e: any) => e.resource) || [],
        medications: medications.entry?.map((e: any) => e.resource) || [],
        conditions: conditions.entry?.map((e: any) => e.resource) || [],
      })
    } catch (e) {
      console.error("Failed to fetch patient details", e)
      // Handle error in UI
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const name = patient.name?.[0] ? `${patient.name[0].given?.join(" ")} ${patient.name[0].family}` : ""
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase())
    // Status filter is not available in FHIR Patient resource directly, so we omit it for now.
    // const matchesStatus = statusFilter === "all" || patient.status.toLowerCase() === statusFilter
    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records ({loading ? "Loading..." : filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading patients...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const name = patient.name?.[0] ? `${patient.name[0].given?.join(" ")} ${patient.name[0].family}` : "N/A"
                    const email = patient.telecom?.find(t => t.system === 'email')?.value
                    const phone = patient.telecom?.find(t => t.system === 'phone')?.value
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{name}</div>
                            <div className="text-sm text-muted-foreground">{email || "No email"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{patient.birthDate}</TableCell>
                        <TableCell className="font-mono">{patient.id}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{phone || "No phone"}</TableCell>
                        <TableCell>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleSelectPatient(patient)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-2xl">
                              <SheetHeader>
                                <SheetTitle>{selectedPatient?.name?.[0] ? `${selectedPatient.name[0].given?.join(" ")} ${selectedPatient.name[0].family}` : "N/A"}</SheetTitle>
                                <SheetDescription>Patient ID: {selectedPatient?.id}</SheetDescription>
                              </SheetHeader>

                              {loadingDetails ? <p>Loading details...</p> : selectedPatient && (
                                <Tabs defaultValue="demographics" className="mt-6">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                                    <TabsTrigger value="allergies">Allergies</TabsTrigger>
                                    <TabsTrigger value="medications">Medications</TabsTrigger>
                                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="demographics" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Full Name</label>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.name?.[0] ? `${selectedPatient.name[0].given?.join(" ")} ${selectedPatient.name[0].family}` : "N/A"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Date of Birth</label>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.birthDate}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center">
                                          <Phone className="w-4 h-4 mr-1" />
                                          Phone
                                        </label>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.telecom?.find(t => t.system === 'phone')?.value || "N/A"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center">
                                          <Mail className="w-4 h-4 mr-1" />
                                          Email
                                        </label>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.telecom?.find(t => t.system === 'email')?.value || "N/A"}</p>
                                      </div>
                                      <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-foreground flex items-center">
                                          <MapPin className="w-4 h-4 mr-1" />
                                          Address
                                        </label>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.address?.[0] ? `${selectedPatient.address[0].line?.join(", ")} ${selectedPatient.address[0].city}, ${selectedPatient.address[0].state} ${selectedPatient.address[0].postalCode}` : "N/A"}</p>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="allergies" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                      {selectedPatient.allergies.map((allergy) => (
                                        <div key={allergy.id} className="p-3 bg-muted/50 rounded-lg">
                                          <p className="font-medium text-foreground">{allergy.code?.text || "No description"}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="medications" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                      {selectedPatient.medications.map((medication) => (
                                        <div key={medication.id} className="p-3 bg-muted/50 rounded-lg">
                                          <p className="font-medium text-foreground">{medication.medicationCodeableConcept?.text || "No description"}</p>
                                          <p className="text-sm text-muted-foreground">Status: {medication.status}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="conditions" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                      {selectedPatient.conditions.map((condition) => (
                                        <div key={condition.id} className="p-3 bg-muted/50 rounded-lg">
                                          <p className="font-medium text-foreground">{condition.code?.text || "No description"}</p>
                                          <p className="text-sm text-muted-foreground">Clinical Status: {condition.clinicalStatus?.coding?.[0]?.code}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
