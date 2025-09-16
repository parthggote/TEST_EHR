"use client"

import { useState, FormEvent, useEffect } from 'react';
import { Condition } from '@/lib/types/fhir';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ConditionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (condition: Partial<Condition>) => Promise<void>;
  patientId: string;
  condition?: Condition | null;
}

// Based on FHIR R4 specification for Condition
const clinicalStatusCodes = ["active", "recurrence", "relapse", "inactive", "remission", "resolved"];
const verificationStatusCodes = ["unconfirmed", "provisional", "differential", "confirmed", "refuted", "entered-in-error"];

export function ConditionForm({ isOpen, onClose, onSubmit, patientId, condition }: ConditionFormProps) {
  const [codeText, setCodeText] = useState('');
  const [clinicalStatus, setClinicalStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (condition) {
      setCodeText(condition.code?.text || '');
      setClinicalStatus(condition.clinicalStatus?.coding?.[0]?.code || '');
      setVerificationStatus(condition.verificationStatus?.coding?.[0]?.code || '');
    } else {
      // Reset form for new entry
      setCodeText('');
      setClinicalStatus('');
      setVerificationStatus('');
    }
  }, [condition]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const conditionData: Partial<Condition> = {
      resourceType: 'Condition',
      subject: { reference: `Patient/${patientId}` },
      code: { text: codeText },
      clinicalStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: clinicalStatus,
        }],
        text: clinicalStatus
      },
      verificationStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: verificationStatus,
        }],
        text: verificationStatus
      },
    };

    if (condition?.id) {
      conditionData.id = condition.id;
    }

    await onSubmit(conditionData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{condition ? 'Edit Condition' : 'Add New Condition'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Condition Description</Label>
            <Input id="code" value={codeText} onChange={(e) => setCodeText(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="clinicalStatus">Clinical Status</Label>
            <Select onValueChange={setClinicalStatus} value={clinicalStatus} required>
              <SelectTrigger id="clinicalStatus">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {clinicalStatusCodes.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="verificationStatus">Verification Status</Label>
            <Select onValueChange={setVerificationStatus} value={verificationStatus} required>
              <SelectTrigger id="verificationStatus">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {verificationStatusCodes.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
