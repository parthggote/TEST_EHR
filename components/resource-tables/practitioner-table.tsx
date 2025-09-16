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

interface Practitioner {
  id: string
  name: { text: string }[]
}

interface PractitionerTableProps {
  practitioners: { data: Practitioner[]; source: string | null }
}

export function PractitionerTable({ practitioners }: PractitionerTableProps) {
  if (practitioners.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Practitioners</CardTitle>
        {practitioners.source && (
          <Badge variant={practitioners.source === 'cache' ? 'secondary' : 'default'}>
            {practitioners.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practitioners.data.map((item) => (
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
