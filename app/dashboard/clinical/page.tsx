"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FileText, Activity, Syringe, TestTube, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { DocumentReference, Observation, DiagnosticReport, Immunization, FHIRBundle } from "@/lib/types/fhir"

export default function ClinicalPage() {
  const [clinicalNotes, setClinicalNotes] = useState<DocumentReference[]>([])
  const [vitals, setVitals] = useState<Observation[]>([])
  const [labResults, setLabResults] = useState<DiagnosticReport[]>([])
  const [immunizations, setImmunizations] = useState<Immunization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // A patient ID would normally come from a context or prop
  const patientId = "ew2oPE1g5V2zGofR3J1D2Q3" // Example patient ID

  useEffect(() => {
    const fetchClinicalData = async () => {
      try {
        setLoading(true)
        const [notesRes, vitalsRes, labsRes, immunizationsRes] = await Promise.all([
          fetch(`/api/fhir/documentreferences?patient=${patientId}`),
          fetch(`/api/fhir/observations?patient=${patientId}&category=vital-signs`),
          fetch(`/api/fhir/diagnosticreports?patient=${patientId}`),
          fetch(`/api/fhir/immunizations?patient=${patientId}`),
        ])

        const notesData: FHIRBundle<DocumentReference> = await notesRes.json()
        const vitalsData: FHIRBundle<Observation> = await vitalsRes.json()
        const labsData: FHIRBundle<DiagnosticReport> = await labsRes.json()
        const immunizationsData: FHIRBundle<Immunization> = await immunizationsRes.json()

        setClinicalNotes(notesData.entry?.map(e => e.resource) || [])
        setVitals(vitalsData.entry?.map(e => e.resource) || [])
        setLabResults(labsData.entry?.map(e => e.resource) || [])
        setImmunizations(immunizationsData.entry?.map(e => e.resource) || [])

      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    if (patientId) {
      fetchClinicalData()
    }
  }, [patientId])

  const getResultColor = (result: string) => {
    switch (result) {
      case "Normal":
      case "normal":
        return "text-green-600"
      case "Elevated":
      case "Low":
      case "Abnormal":
        return "text-yellow-600"
      case "Critical":
        return "text-red-600"
      case "Pending":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "not-done":
        return "bg-yellow-500"
      case "entered-in-error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatVitalsForChart = (vitals: Observation[]) => {
    // This is a simplified transformation. A real implementation would need more robust logic
    // to handle different vital signs and units.
    return vitals.map(vital => ({
      date: new Date(vital.effectiveDateTime!).toLocaleDateString(),
      systolic: vital.component?.find(c => c.code.coding?.[0].code === '8480-6')?.valueQuantity?.value,
      diastolic: vital.component?.find(c => c.code.coding?.[0].code === '8462-4')?.valueQuantity?.value,
    })).slice(0, 10) // Limit for display
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clinical Data</h1>
            <p className="text-muted-foreground">Manage clinical notes, vitals, lab results, and immunizations</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Clinical Note
          </Button>
        </div>

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
            <TabsTrigger value="vitals">Vitals Tracker</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
                  <div className="space-y-4">
                    {clinicalNotes.map((note) => (
                      <Card key={note.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">{note.type?.text}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(note.date!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{note.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Blood Pressure Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatVitalsForChart(vitals)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="systolic" stroke="#8b5cf6" strokeWidth={2} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#06b6d4" strokeWidth={2} name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Simplified vitals display */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="labs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="w-5 h-5 mr-2" />
                  Laboratory Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labResults.map((lab) => (
                        <TableRow key={lab.id}>
                          <TableCell className="font-medium">{lab.code.text}</TableCell>
                          <TableCell>
                            <span className={getResultColor(lab.conclusion!)}>{lab.conclusion}</span>
                          </TableCell>
                          <TableCell>{new Date(lab.effectiveDateTime!).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={lab.status === "final" ? "default" : "secondary"}>{lab.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="immunizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Syringe className="w-5 h-5 mr-2" />
                  Immunization Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
                  <div className="space-y-4">
                    {immunizations.map((immunization) => (
                      <div key={immunization.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(immunization.status)}`} />
                          <div>
                            <p className="font-medium text-foreground">{immunization.vaccineCode.text}</p>
                            <p className="text-sm text-muted-foreground">
                              {immunization.occurrenceDateTime ? `Given: ${new Date(immunization.occurrenceDateTime).toLocaleDateString()}` : "Not administered"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(immunization.status)} text-white border-0`}
                          >
                            {immunization.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
