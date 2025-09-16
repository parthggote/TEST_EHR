import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Patient {
  id: string
  name: { text: string }[]
  gender: string
  birthDate: string
}

interface PatientTableProps {
  patients: { data: Patient[]; source: string | null }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function PatientTable({ patients }: PatientTableProps) {
  if (patients.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patients</CardTitle>
        {patients.source && (
          <Badge variant={patients.source === 'cache' ? 'secondary' : 'default'}>
            {patients.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Birth Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.data.map((item) => (
              <TableRow key={(item as any)._id}>
                <TableCell>
                  <Link href={`/dashboard/clinician/patients/${(item as any)._id}`} className="text-primary hover:underline">
                    {item.name?.[0]?.text || 'N/A'}
                  </Link>
                </TableCell>
                <TableCell>{item.gender || 'N/A'}</TableCell>
                <TableCell>{formatDate(item.birthDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
