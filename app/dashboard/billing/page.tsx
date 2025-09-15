"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { DollarSign, CreditCard, FileText, Plus, Search, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { ExplanationOfBenefit, Coverage, FHIRBundle, Patient } from "@/lib/types/fhir"

export default function BillingPage() {
  const [transactions, setTransactions] = useState<ExplanationOfBenefit[]>([])
  const [coverage, setCoverage] = useState<Coverage[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false)
  const [isInsuranceCheckOpen, setIsInsuranceCheckOpen] = useState(false)

  // A patient ID would normally come from a context or prop
  const patientId = "ew2oPE1g5V2zGofR3J1D2Q3" // Example patient ID

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true)
        const [transactionsRes, coverageRes, patientsRes] = await Promise.all([
          fetch(`/api/fhir/explanationofbenefit?patient=${patientId}`),
          fetch(`/api/fhir/coverage?patient=${patientId}`),
          fetch(`/api/fhir/patients`),
        ])

        const transactionsData: FHIRBundle<ExplanationOfBenefit> = await transactionsRes.json()
        const coverageData: FHIRBundle<Coverage> = await coverageRes.json()
        const patientsData: FHIRBundle<Patient> = await patientsRes.json()

        setTransactions(transactionsData.entry?.map(e => e.resource) || [])
        setCoverage(coverageData.entry?.map(e => e.resource) || [])
        setPatients(patientsData.entry?.map(e => e.resource) || [])

      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    if (patientId) {
      fetchBillingData()
    }
  }, [patientId])

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId.replace("Patient/", ""))
    return patient?.name?.[0] ? `${patient.name[0].given?.join(" ")} ${patient.name[0].family}` : "Unknown Patient"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "cancelled":
        return "bg-yellow-500"
      case "draft":
        return "bg-blue-500"
      case "entered-in-error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // These calculations would need to be derived from the fetched ExplanationOfBenefit data
  const totalBilled = transactions.reduce((sum, t) => sum + (t.total?.[0].amount.value || 0), 0)
  const insurancePortion = transactions.reduce((sum, t) => sum + (t.total?.[1]?.amount.value || 0), 0)
  const patientPortion = transactions.reduce((sum, t) => sum + (t.total?.[2]?.amount.value || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground">Manage billing, insurance claims, and financial transactions</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isInsuranceCheckOpen} onOpenChange={setIsInsuranceCheckOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Check Insurance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insurance Eligibility Check</DialogTitle>
                  <DialogDescription>This feature is not yet implemented.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id!}>{p.name?.[0] ? `${p.name[0].given?.join(" ")} ${p.name[0].family}` : "N/A"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payer">Insurance Payer</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aetna">Aetna</SelectItem>
                        <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                        <SelectItem value="cigna">Cigna</SelectItem>
                        <SelectItem value="medicare">Medicare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsInsuranceCheckOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>Check Eligibility</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddChargeOpen} onOpenChange={setIsAddChargeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Charge</DialogTitle>
                  <DialogDescription>This feature is not yet implemented.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id!}>{p.name?.[0] ? `${p.name[0].given?.join(" ")} ${p.name[0].family}` : "N/A"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Procedure Code</Label>
                      <Input placeholder="e.g., 99213" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input type="number" placeholder="0.00" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input placeholder="Service description" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Service Date</Label>
                    <Input type="date" defaultValue="2024-01-15" disabled />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddChargeOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>Add Charge</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${insurancePortion.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${patientPortion.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBilled.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search transactions..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{getPatientName(transaction.patient.reference!)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(transaction.created).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.item?.[0]?.productOrService.text}</TableCell>
                          <TableCell className="font-medium">${transaction.total?.[0].amount.value.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(transaction.status)} text-white border-0`}
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics charts are complex and would require significant data transformation. */}
            {/* Leaving as is for now. */}
            <p>Analytics charts will be connected in a future step.</p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
