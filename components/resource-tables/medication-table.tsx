import { Badge } from '@/components/ui/badge'
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
  medications: { data: Medication[]; source: string | null }
}

export function MedicationTable({ medications }: MedicationTableProps) {
  if (medications.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medication Requests</CardTitle>
        {medications.source && (
          <Badge variant={medications.source === 'cache' ? 'secondary' : 'default'}>
            {medications.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
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
            {medications.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.medicationCodeableConcept?.text || 'N/A'}
                </TableCell>
                <TableCell>{item.subject?.display || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
