"use client"

import { useState } from "react"
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

// Mock patient data
const patients = [
  {
    id: "P001",
    name: "Sarah Johnson",
    dob: "1985-03-15",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    lastVisit: "2024-01-15",
    provider: "Dr. Smith",
    status: "Active",
    address: "123 Main St, City, ST 12345",
    allergies: ["Penicillin", "Shellfish"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
  },
  {
    id: "P002",
    name: "Michael Chen",
    dob: "1978-11-22",
    phone: "(555) 987-6543",
    email: "m.chen@email.com",
    lastVisit: "2024-01-10",
    provider: "Dr. Johnson",
    status: "Active",
    address: "456 Oak Ave, City, ST 12345",
    allergies: ["None known"],
    medications: ["Atorvastatin 20mg"],
    conditions: ["High Cholesterol"],
  },
  {
    id: "P003",
    name: "Emma Davis",
    dob: "1992-07-08",
    phone: "(555) 456-7890",
    email: "emma.davis@email.com",
    lastVisit: "2024-01-08",
    provider: "Dr. Smith",
    status: "Active",
    address: "789 Pine St, City, ST 12345",
    allergies: ["Latex"],
    medications: ["Birth Control"],
    conditions: ["None"],
  },
  {
    id: "P004",
    name: "James Wilson",
    dob: "1965-12-03",
    phone: "(555) 321-0987",
    email: "j.wilson@email.com",
    lastVisit: "2023-12-20",
    provider: "Dr. Johnson",
    status: "Inactive",
    address: "321 Elm St, City, ST 12345",
    allergies: ["Aspirin"],
    medications: ["Warfarin 5mg", "Metoprolol 50mg"],
    conditions: ["Atrial Fibrillation", "Heart Disease"],
  },
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null)

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
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
                  id="patient-search"
                  name="patient-search"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" name="status-filter" className="w-full sm:w-48">
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
            <CardTitle>Patient Records ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">{patient.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.dob}</TableCell>
                    <TableCell className="font-mono">{patient.id}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>{patient.provider}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "Active" ? "default" : "secondary"}>{patient.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(patient)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-2xl">
                          <SheetHeader>
                            <SheetTitle>{selectedPatient?.name}</SheetTitle>
                            <SheetDescription>Patient ID: {selectedPatient?.id}</SheetDescription>
                          </SheetHeader>

                          {selectedPatient && (
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
                                    <p className="text-sm text-muted-foreground">{selectedPatient.name}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Date of Birth</label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.dob}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground flex items-center">
                                      <Phone className="w-4 h-4 mr-1" />
                                      Phone
                                    </label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground flex items-center">
                                      <Mail className="w-4 h-4 mr-1" />
                                      Email
                                    </label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-foreground flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      Address
                                    </label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.address}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Provider</label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.provider}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Last Visit</label>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.lastVisit}</p>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="allergies" className="space-y-4 mt-4">
                                <div className="space-y-3">
                                  {selectedPatient.allergies.map((allergy, index) => (
                                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                      <p className="font-medium text-foreground">{allergy}</p>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>

                              <TabsContent value="medications" className="space-y-4 mt-4">
                                <div className="space-y-3">
                                  {selectedPatient.medications.map((medication, index) => (
                                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                      <p className="font-medium text-foreground">{medication}</p>
                                      <p className="text-sm text-muted-foreground">Active prescription</p>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>

                              <TabsContent value="conditions" className="space-y-4 mt-4">
                                <div className="space-y-3">
                                  {selectedPatient.conditions.map((condition, index) => (
                                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                      <p className="font-medium text-foreground">{condition}</p>
                                      <p className="text-sm text-muted-foreground">Ongoing condition</p>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
