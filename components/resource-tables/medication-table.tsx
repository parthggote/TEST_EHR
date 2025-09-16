import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Medication {
  id: string
  medicationCodeableConcept: { text: string }
  subject: { display: string }
}

interface MedicationTableProps {
  medications: Medication[]
}

export function MedicationTable({ medications }: MedicationTableProps) {
  if (medications.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Patient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.medicationCodeableConcept.text}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
