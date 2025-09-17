"use client"

import { useState, useEffect, FormEvent } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, DollarSign, CreditCard, FileText, Plus } from "lucide-react";
import { ExplanationOfBenefit } from "@/lib/types/fhir";
import { ChargeForm } from "@/components/charge-form";
import { useToast } from "@/hooks/use-toast";

export default function ClinicianBillingPage() {
  const [transactions, setTransactions] = useState<ExplanationOfBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPatientId, setSearchPatientId] = useState("");
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchBillingData = async (patientId = "") => {
    if (!patientId) {
      toast({ title: "Error", description: "Please enter a Patient ID to search.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const query = `?patient=${patientId}`;
      const response = await fetch(`/api/clinician/billing${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch billing data');
      }
      const data = await response.json();
      setTransactions(data.entry?.map((e: any) => e.resource) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchBillingData(searchPatientId);
  };

  // Calculate summary data
  const totalBilled = transactions.reduce((sum, t) => sum + (t.total?.[0]?.value?.value || 0), 0);
  const totalPaidByInsurance = transactions.reduce((sum, t) => {
      const insurancePayment = t.payment?.amount?.value || 0;
      return sum + insurancePayment;
  }, 0);
  const totalPatientResponsibility = totalBilled - totalPaidByInsurance;

  const handleAddCharge = async (chargeData: any) => {
    try {
      const response = await fetch('/api/clinician/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create charge');
      }

      toast({ title: "Success", description: "New charge has been added." });
      setIsChargeFormOpen(false);
      // Refresh data after adding charge
      fetchBillingData(searchPatientId);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "An unknown error occurred", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout userType="clinician">
      <ChargeForm
        isOpen={isChargeFormOpen}
        onClose={() => setIsChargeFormOpen(false)}
        onSubmit={handleAddCharge}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground">View and manage billing across all patients.</p>
          </div>
          <Button onClick={() => setIsChargeFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Charge
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPaidByInsurance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Responsibility</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPatientResponsibility.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                id="patient-search"
                name="patient-search"
                placeholder="Search by Patient ID..."
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
                className="max-w-xs"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </form>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Billed</TableHead>
                  <TableHead>Patient Pays</TableHead>
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
                  transactions.map((eob) => {
                    const total = eob.total?.[0]?.value?.value || 0;
                    const patientPortion = eob.payment?.amount?.value ? total - eob.payment.amount.value : total;
                    return (
                      <TableRow key={eob.id}>
                        <TableCell className="font-mono">{eob.id}</TableCell>
                        <TableCell className="font-mono">{eob.patient?.reference?.replace('Patient/', '')}</TableCell>
                        <TableCell>{new Date(eob.created).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={eob.status === 'active' ? 'default' : 'secondary'}>{eob.status}</Badge>
                        </TableCell>
                        <TableCell>${total.toFixed(2)}</TableCell>
                        <TableCell>${patientPortion.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {!isLoading && transactions.length === 0 && !error && (
              <p className="text-center text-muted-foreground py-8">No billing records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
