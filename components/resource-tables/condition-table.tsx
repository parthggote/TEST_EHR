import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Condition {
  id: string
  code: { text: string }
  subject: { display: string }
}

interface ConditionTableProps {
  conditions: Condition[]
}

export function ConditionTable({ conditions }: ConditionTableProps) {
  if (conditions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condition</TableHead>
              <TableHead>Patient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code.text}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
