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
  observations: Observation[]
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
  if (observations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observations</CardTitle>
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
            {observations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code.text}</TableCell>
                <TableCell>{formatValue(item)}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
