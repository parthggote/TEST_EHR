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

interface Immunization {
  id: string
  vaccineCode: { text: string }
  patient: { display: string }
  occurrenceDateTime: string
}

interface ImmunizationTableProps {
  immunizations: { data: Immunization[]; source: string | null }
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
  if (immunizations.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Immunizations</CardTitle>
        {immunizations.source && (
          <Badge variant={immunizations.source === 'cache' ? 'secondary' : 'default'}>
            {immunizations.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
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
            {immunizations.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.vaccineCode?.text || 'N/A'}</TableCell>
                <TableCell>{item.patient?.display || 'N/A'}</TableCell>
                <TableCell>{formatDate(item.occurrenceDateTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
