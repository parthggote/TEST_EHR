"use client"

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ChargeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chargeData: any) => Promise<void>;
}

export function ChargeForm({ isOpen, onClose, onSubmit }: ChargeFormProps) {
  const [patientId, setPatientId] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const chargeItemData = {
      resourceType: 'ChargeItem',
      status: 'billable',
      subject: { reference: `Patient/${patientId}` },
      code: {
        coding: [{
          system: "http://www.ama-assn.org/go/cpt", // Example system
          code: code,
        }],
        text: `Procedure code ${code}`,
      },
      priceOverride: {
        currency: 'USD',
        value: parseFloat(price),
      },
    };

    await onSubmit(chargeItemData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Charge</DialogTitle>
          <DialogDescription>Create a new billing charge for a patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input id="patientId" name="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="code">Procedure Code (CPT)</Label>
            <Input id="code" name="code" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" name="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add Charge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
