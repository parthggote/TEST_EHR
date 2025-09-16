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

interface AllergyIntolerance {
  id: string
  code: { text: string }
  patient: { display: string }
}

interface AllergyTableProps {
  allergies: { data: AllergyIntolerance[]; source: string | null }
}

export function AllergyTable({ allergies }: AllergyTableProps) {
  if (allergies.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allergies</CardTitle>
        {allergies.source && (
          <Badge variant={allergies.source === 'cache' ? 'secondary' : 'default'}>
            {allergies.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
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
            {allergies.data.map((item) => (
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
