'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type BulkImportStatus =
  | 'idle'
  | 'starting'
  | 'in-progress'
  | 'complete'
  | 'error'

export default function ClinicianDashboardPage() {
  const [importStatus, setImportStatus] = useState<BulkImportStatus>('idle')
  const [statusUrl, setStatusUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startBulkImport = async () => {
    setImportStatus('starting')
    setError(null)
    setManifest(null)
    try {
      const response = await fetch('/api/clinician/bulk-data/start', {
        method: 'POST',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to start bulk import')
      }
      const { statusUrl } = await response.json()
      setStatusUrl(statusUrl)
      setImportStatus('in-progress')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setImportStatus('error')
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      if (!statusUrl) return

      try {
        const response = await fetch(
          `/api/clinician/bulk-data/status?url=${encodeURIComponent(statusUrl)}`
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to check status')
        }

        const data = await response.json()

        if (response.headers.get('X-Progress')) {
          setProgress(response.headers.get('X-Progress'))
        }

        if (data.status === 'complete') {
          setManifest(data.manifest)
          setImportStatus('complete')
          setStatusUrl(null) // Stop polling
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setImportStatus('error')
        setStatusUrl(null) // Stop polling
      }
    }

    if (importStatus === 'in-progress' && statusUrl) {
      // Poll every 5 seconds
      intervalId = setInterval(checkStatus, 5000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [importStatus, statusUrl])

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bulk Data Management
            </h1>
            <p className="text-muted-foreground">
              Import and manage data for all patients in the test group.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Patient Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Click the button below to start the bulk import process for all
              test patients in the group. This will fetch all available data
              from the FHIR server.
            </p>
            <Button
              onClick={startBulkImport}
              disabled={importStatus === 'starting' || importStatus === 'in-progress'}
            >
              {importStatus === 'in-progress'
                ? 'Importing...'
                : 'Start Bulk Import'}
            </Button>

            {importStatus !== 'idle' && (
              <div className="pt-4">
                <h3 className="font-semibold">Import Status:</h3>
                <p>
                  Current Status:{' '}
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {importStatus}
                  </span>
                </p>
                {importStatus === 'in-progress' && progress && (
                  <p>Progress: {progress}</p>
                )}
                {importStatus === 'error' && (
                  <p className="text-destructive">Error: {error}</p>
                )}
                {importStatus === 'complete' && manifest && (
                  <div>
                    <h3 className="font-semibold mt-4">
                      Import Complete!
                    </h3>
                    <p>
                      The following data has been exported. In a future step,
                      this data would be parsed and stored in the database.
                    </p>
                    <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-sm">
                      {JSON.stringify(manifest, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
