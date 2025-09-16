import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AllergyIntolerance {
  id: string
  code: { text: string }
  patient: { display: string }
}

interface AllergyTableProps {
  allergies: AllergyIntolerance[]
}

export function AllergyTable({ allergies }: AllergyTableProps) {
  if (allergies.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergies</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Substance</TableHead>
              <TableHead>Patient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allergies.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code?.text || 'N/A'}</TableCell>
                <TableCell>{item.patient?.display || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
