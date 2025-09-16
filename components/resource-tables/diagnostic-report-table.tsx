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

interface DiagnosticReport {
  id: string
  code: { text: string }
  subject: { display: string }
  conclusion: string
}

interface DiagnosticReportTableProps {
  reports: { data: DiagnosticReport[]; source: string | null }
}

export function DiagnosticReportTable({ reports }: DiagnosticReportTableProps) {
  if (reports.data.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Diagnostic Reports</CardTitle>
        {reports.source && (
          <Badge variant={reports.source === 'cache' ? 'secondary' : 'default'}>
            {reports.source === 'cache' ? 'From Cache' : 'Live'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Conclusion</TableHead>
              <TableHead>Patient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code?.text || 'N/A'}</TableCell>
                <TableCell>{item.conclusion || 'N/A'}</TableCell>
                <TableCell>{item.subject?.display || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
