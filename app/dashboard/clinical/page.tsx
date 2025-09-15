"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FileText, Activity, Syringe, TestTube, Plus, TrendingUp, TrendingDown } from "lucide-react"

// Mock clinical data
const clinicalNotes = [
  {
    id: "N001",
    date: "2024-01-15",
    provider: "Dr. Smith",
    patient: "Sarah Johnson",
    type: "Progress Note",
    content:
      "Patient reports feeling well. Blood pressure controlled on current medication. Continue current treatment plan.",
    tags: ["Hypertension", "Follow-up"],
  },
  {
    id: "N002",
    date: "2024-01-14",
    provider: "Dr. Johnson",
    patient: "Michael Chen",
    type: "Consultation",
    content: "New patient consultation for chest pain. EKG normal. Recommend stress test and lipid panel.",
    tags: ["Chest Pain", "Cardiology"],
  },
  {
    id: "N003",
    date: "2024-01-13",
    provider: "Dr. Smith",
    patient: "Emma Davis",
    type: "Annual Physical",
    content: "Annual physical examination. All systems normal. Discussed preventive care and lifestyle modifications.",
    tags: ["Preventive Care", "Annual"],
  },
]

const vitalsData = [
  { date: "Jan 1", systolic: 120, diastolic: 80, heartRate: 72, weight: 150 },
  { date: "Jan 8", systolic: 118, diastolic: 78, heartRate: 70, weight: 149 },
  { date: "Jan 15", systolic: 122, diastolic: 82, heartRate: 74, weight: 151 },
  { date: "Jan 22", systolic: 119, diastolic: 79, heartRate: 71, weight: 150 },
  { date: "Jan 29", systolic: 121, diastolic: 81, heartRate: 73, weight: 148 },
]

const labResults = [
  {
    id: "L001",
    test: "Complete Blood Count",
    result: "Normal",
    normalRange: "4.5-11.0 K/uL",
    value: "7.2 K/uL",
    date: "2024-01-15",
    status: "Final",
  },
  {
    id: "L002",
    test: "Lipid Panel",
    result: "Elevated",
    normalRange: "<200 mg/dL",
    value: "245 mg/dL",
    date: "2024-01-14",
    status: "Final",
  },
  {
    id: "L003",
    test: "HbA1c",
    result: "Normal",
    normalRange: "<5.7%",
    value: "5.4%",
    date: "2024-01-12",
    status: "Final",
  },
  {
    id: "L004",
    test: "Thyroid Function",
    result: "Pending",
    normalRange: "0.4-4.0 mIU/L",
    value: "Pending",
    date: "2024-01-15",
    status: "Pending",
  },
]

const immunizations = [
  {
    id: "I001",
    vaccine: "COVID-19 Booster",
    date: "2023-12-15",
    status: "Completed",
    nextDue: "2024-12-15",
    provider: "Dr. Smith",
  },
  {
    id: "I002",
    vaccine: "Influenza",
    date: "2023-10-01",
    status: "Completed",
    nextDue: "2024-10-01",
    provider: "Dr. Johnson",
  },
  {
    id: "I003",
    vaccine: "Tdap",
    date: "2021-03-15",
    status: "Completed",
    nextDue: "2031-03-15",
    provider: "Dr. Smith",
  },
  {
    id: "I004",
    vaccine: "Pneumococcal",
    date: null,
    status: "Due",
    nextDue: "2024-02-01",
    provider: null,
  },
]

export default function ClinicalPage() {
  const [selectedPatient, setSelectedPatient] = useState("All Patients")

  const getResultColor = (result: string) => {
    switch (result) {
      case "Normal":
        return "text-green-600"
      case "Elevated":
      case "Low":
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
      case "Completed":
        return "bg-green-500"
      case "Due":
        return "bg-yellow-500"
      case "Overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
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
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
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
                <div className="space-y-4">
                  {clinicalNotes.map((note) => (
                    <Card key={note.id} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-foreground">{note.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {note.patient} • {note.provider} • {note.date}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                    <LineChart data={vitalsData}>
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Latest Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Blood Pressure</span>
                      <div className="flex items-center">
                        <span className="font-medium">121/81</span>
                        <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Heart Rate</span>
                      <div className="flex items-center">
                        <span className="font-medium">73 bpm</span>
                        <TrendingDown className="w-4 h-4 ml-1 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Weight</span>
                      <div className="flex items-center">
                        <span className="font-medium">148 lbs</span>
                        <TrendingDown className="w-4 h-4 ml-1 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Vital Signs History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vitalsData.slice(-3).map((vital, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{vital.date}</span>
                            <span className="font-medium">
                              {vital.systolic}/{vital.diastolic}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Normal Range</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labResults.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.test}</TableCell>
                        <TableCell>
                          <span className={getResultColor(lab.result)}>{lab.result}</span>
                        </TableCell>
                        <TableCell className="font-mono">{lab.value}</TableCell>
                        <TableCell className="text-muted-foreground">{lab.normalRange}</TableCell>
                        <TableCell>{lab.date}</TableCell>
                        <TableCell>
                          <Badge variant={lab.status === "Final" ? "default" : "secondary"}>{lab.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <div className="space-y-4">
                  {immunizations.map((immunization) => (
                    <div key={immunization.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(immunization.status)}`} />
                        <div>
                          <p className="font-medium text-foreground">{immunization.vaccine}</p>
                          <p className="text-sm text-muted-foreground">
                            {immunization.date ? `Given: ${immunization.date}` : "Not administered"}
                            {immunization.provider && ` • ${immunization.provider}`}
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
                        <p className="text-xs text-muted-foreground mt-1">Next due: {immunization.nextDue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
