import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Procedure {
  id: string
  code: { text: string }
  subject: { display: string }
  performedDateTime: string
}

interface ProcedureTableProps {
  procedures: Procedure[]
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function ProcedureTable({ procedures }: ProcedureTableProps) {
  if (procedures.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procedures</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Procedure</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code.text}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
                <TableCell>{formatDate(item.performedDateTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
