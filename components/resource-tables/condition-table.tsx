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

interface Condition {
  id: string
  code: { text: string }
  subject: { display: string }
}

interface ConditionTableProps {
  conditions: { data: Condition[]; source: string | null }
}

export function ConditionTable({ conditions }: ConditionTableProps) {
  if (conditions.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conditions</CardTitle>
        {conditions.source && (
          <Badge variant={conditions.source === 'cache' ? 'secondary' : 'default'}>
            {conditions.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
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
            {conditions.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code?.text || 'N/A'}</TableCell>
                <TableCell>{item.subject?.display || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
