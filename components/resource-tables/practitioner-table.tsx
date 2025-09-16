import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Practitioner {
  id: string
  name: { text: string }[]
}

interface PractitionerTableProps {
  practitioners: Practitioner[]
}

export function PractitionerTable({ practitioners }: PractitionerTableProps) {
  if (practitioners.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practitioners</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practitioners.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name?.[0]?.text || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
