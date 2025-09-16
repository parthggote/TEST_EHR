import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Immunization {
  id: string
  vaccineCode: { text: string }
  patient: { display: string }
  occurrenceDateTime: string
}

interface ImmunizationTableProps {
  immunizations: Immunization[]
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function ImmunizationTable({ immunizations }: ImmunizationTableProps) {
  if (immunizations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immunizations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaccine</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {immunizations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.vaccineCode.text}</TableCell>
                <TableCell>{item.patient.display}</TableCell>
                <TableCell>{formatDate(item.occurrenceDateTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
