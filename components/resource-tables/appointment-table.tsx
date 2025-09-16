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

interface Appointment {
  id: string
  description: string
  start: string
  participant: { actor: { display: string } }[]
}

interface AppointmentTableProps {
  appointments: { data: Appointment[]; source: string | null }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  if (appointments.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointments</CardTitle>
        {appointments.source && (
          <Badge variant={appointments.source === 'cache' ? 'secondary' : 'default'}>
            {appointments.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description || 'N/A'}</TableCell>
                <TableCell>
                  {item.participant?.[0]?.actor?.display || 'N/A'}
                </TableCell>
                <TableCell>{formatDate(item.start)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
