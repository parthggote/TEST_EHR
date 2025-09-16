import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  patients: Patient[]
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
  if (patients.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
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
            {patients.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name?.[0]?.text || 'N/A'}</TableCell>
                <TableCell>{item.gender}</TableCell>
                <TableCell>{formatDate(item.birthDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
