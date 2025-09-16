"use client"

import { useState, FormEvent, useEffect } from 'react';
import { Appointment } from '@/lib/types/fhir';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Partial<Appointment>) => Promise<void>;
  patientId: string;
  appointment?: Appointment | null;
}

export function AppointmentForm({ isOpen, onClose, onSubmit, patientId, appointment }: AppointmentFormProps) {
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setDescription(appointment.description || '');
      setStart(appointment.start ? new Date(appointment.start).toISOString().slice(0, 16) : '');
      setEnd(appointment.end ? new Date(appointment.end).toISOString().slice(0, 16) : '');
    } else {
      setDescription('');
      setStart('');
      setEnd('');
    }
  }, [appointment]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const appointmentData: Partial<Appointment> = {
      resourceType: 'Appointment',
      status: 'booked',
      description,
      start,
      end,
      participant: [
        {
          actor: { reference: `Patient/${patientId}` },
          status: 'accepted',
        },
      ],
    };

    if (appointment?.id) {
      appointmentData.id = appointment.id;
    }

    await onSubmit(appointmentData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment ? 'Edit Appointment' : 'Book New Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="start">Start Time</Label>
            <Input id="start" name="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="end">End Time</Label>
            <Input id="end" name="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
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
