"use client"

import { useState, FormEvent } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Condition } from "@/lib/types/fhir";
import { ConditionForm } from "@/components/condition-form";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

export default function ClinicianConditionsPage() {
  const [patientId, setPatientId] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State for modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [deletingCondition, setDeletingCondition] = useState<Condition | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError("Patient ID is required to search for conditions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setConditions([]);

    try {
      // This endpoint needs to be created/completed
      const response = await fetch(`/api/clinician/conditions?patient=${patientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch conditions');
      }
      const data = await response.json();
      setConditions(data.entry?.map((entry: any) => entry.resource) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCondition = async (conditionData: Partial<Condition>) => {
    try {
      const response = await fetch('/api/clinician/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conditionData),
      });
      if (!response.ok) throw new Error('Failed to add condition');
      setIsAdding(false);
      setNotification({ type: 'success', message: 'Condition added successfully!' });
      handleSearch(new Event('submit') as unknown as FormEvent); // Refresh list
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  };

  const handleEditCondition = async (conditionData: Partial<Condition>) => {
    if (!editingCondition?.id) return;
    try {
      const response = await fetch(`/api/clinician/conditions/${editingCondition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conditionData),
      });
      if (!response.ok) throw new Error('Failed to update condition');
      setEditingCondition(null);
      setNotification({ type: 'success', message: 'Condition updated successfully!' });
      handleSearch(new Event('submit') as unknown as FormEvent); // Refresh list
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  };

  const handleDeleteCondition = async () => {
    if (!deletingCondition?.id) return;
    try {
      await fetch(`/api/clinician/conditions/${deletingCondition.id}`, { method: 'DELETE' });
      setDeletingCondition(null);
      setNotification({ type: 'success', message: 'Condition deleted successfully!' });
      handleSearch(new Event('submit') as unknown as FormEvent); // Refresh list
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  };

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Condition Management</h1>
            <p className="text-muted-foreground">Search and manage patient conditions.</p>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setIsAdding(true)}
            disabled={!patientId || isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </Button>
        </div>

        {notification && (
          <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
            <button onClick={() => setNotification(null)} className="float-right font-bold">X</button>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter Patient ID to find conditions..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Find Conditions
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condition Results ({conditions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condition ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Clinical Status</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead>Recorded Date</TableHead>
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
                  conditions.map((condition) => (
                    <TableRow key={condition.id}>
                      <TableCell className="font-mono">{condition.id}</TableCell>
                      <TableCell>{condition.code?.text || 'N/A'}</TableCell>
                      <TableCell>{condition.clinicalStatus?.text || 'N/A'}</TableCell>
                      <TableCell>{condition.verificationStatus?.text || 'N/A'}</TableCell>
                      <TableCell>{condition.recordedDate ? new Date(condition.recordedDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCondition(condition)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingCondition(condition)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!isLoading && conditions.length === 0 && !error && (
              <p className="text-center text-muted-foreground py-8">No conditions found for this patient.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdding && (
        <ConditionForm
          isOpen={isAdding}
          onClose={() => setIsAdding(false)}
          onSubmit={handleAddCondition}
          patientId={patientId}
        />
      )}

      {editingCondition && (
        <ConditionForm
          isOpen={!!editingCondition}
          onClose={() => setEditingCondition(null)}
          onSubmit={handleEditCondition}
          patientId={patientId}
          condition={editingCondition}
        />
      )}

      <ConfirmationDialog
        isOpen={!!deletingCondition}
        onClose={() => setDeletingCondition(null)}
        onConfirm={handleDeleteCondition}
        title="Are you sure you want to delete this condition?"
        description="This action cannot be undone."
      />
    </DashboardLayout>
  )
}
