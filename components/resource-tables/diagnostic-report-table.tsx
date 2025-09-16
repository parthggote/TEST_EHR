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
  reports: DiagnosticReport[]
}

export function DiagnosticReportTable({ reports }: DiagnosticReportTableProps) {
  if (reports.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic Reports</CardTitle>
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
            {reports.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code.text}</TableCell>
                <TableCell>{item.conclusion}</TableCell>
                <TableCell>{item.subject.display}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
