import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DocumentReference {
  id: string
  description: string
  subject: { display: string }
  date: string
}

interface DocumentReferenceTableProps {
  documents: DocumentReference[]
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function DocumentReferenceTable({ documents }: DocumentReferenceTableProps) {
  if (documents.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document References</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
