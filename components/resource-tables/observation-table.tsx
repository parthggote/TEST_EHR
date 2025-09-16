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

interface Observation {
  id: string
  code: { text: string }
  subject: { display: string }
  valueQuantity?: { value: number; unit: string }
  valueString?: string
}

interface ObservationTableProps {
  observations: { data: Observation[]; source: string | null }
}

const formatValue = (obs: Observation): string => {
  if (obs.valueQuantity) {
    return `${obs.valueQuantity.value} ${obs.valueQuantity.unit}`
  }
  if (obs.valueString) {
    return obs.valueString
  }
  return 'N/A'
}

export function ObservationTable({ observations }: ObservationTableProps) {
  if (observations.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Observations</CardTitle>
        {observations.source && (
          <Badge variant={observations.source === 'cache' ? 'secondary' : 'default'}>
            {observations.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Observation</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Patient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observations.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code?.text || 'N/A'}</TableCell>
                <TableCell>{formatValue(item)}</TableCell>
                <TableCell>{item.subject?.display || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
