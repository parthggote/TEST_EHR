'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Patient {
  _id?: string
  name: { text: string }[]
  gender: string
  birthDate: string
}

interface PatientFormProps {
  patient?: Patient
  isEditing?: boolean
}

export function PatientForm({ patient, isEditing = false }: PatientFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Patient>(
    patient || {
      name: [{ text: '' }],
      gender: 'unknown',
      birthDate: '',
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      setFormData({ ...formData, name: [{ text: value }] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const url = isEditing
      ? `/api/clinician/patients/${patient?._id}`
      : '/api/clinician/patients'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to save patient')
      }

      // Redirect to the patient list after successful submission
      router.push('/dashboard/clinician/patients')
      router.refresh() // Refresh the page to show the new data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Patient' : 'Create New Patient'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name[0].text}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={handleGenderChange}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </Button>
          {error && <p className="text-destructive">Error: {error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
