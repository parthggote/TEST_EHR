"use client"

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText } from "lucide-react";

type JobStatus = 'idle' | 'starting' | 'polling' | 'complete' | 'error';

interface ManifestFile {
  type: string;
  url: string;
  count?: number;
}

export default function BulkDataExportPage() {
  const { toast } = useToast();
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle');
  const [statusUrl, setStatusUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [manifest, setManifest] = useState<{ output: ManifestFile[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const handleDownload = async (fileUrl: string, fileType: string) => {
    if (downloadingUrl) return;
    setDownloadingUrl(fileUrl);

    try {
      const response = await fetch('/api/clinician/bulk-data/fetch-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl, fileType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Failed to download file for ${fileType}`);
      }

      const { data } = await response.json();

      const ndjson = data.map((item: any) => JSON.stringify(item)).join('\n');

      const blob = new Blob([ndjson], { type: 'application/fhir+ndjson' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}.ndjson`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Your download for ${fileType}.ndjson has started.`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Download Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDownloadingUrl(null);
    }
  };

  const handleStartExport = async () => {
    setJobStatus('starting');
    setError(null);
    setManifest(null);
    setProgress(null);
    setStatusUrl(null);

    try {
      const response = await fetch('/api/clinician/bulk-data/export', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to start export job.");
      }
      const data = await response.json();
      setStatusUrl(data.statusUrl);
      setJobStatus('polling');
      toast({ title: "Success", description: "Bulk data export job has been started." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setJobStatus('error');
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const pollStatus = useCallback(async () => {
    if (!statusUrl) return;

    try {
      const response = await fetch(`/api/clinician/bulk-data/status?url=${encodeURIComponent(statusUrl)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to check job status.");
      }
      const data = await response.json();

      if (data.status === 'in-progress') {
        setProgress(data.progress);
      } else if (data.status === 'complete') {
        setManifest(data.manifest);
        setJobStatus('complete');
        setStatusUrl(null); // Stop polling
        toast({ title: "Export Complete!", description: "Your data is ready for download." });

        // Automatically trigger caching of patient data in the background
        const patientFile = data.manifest.output.find((f: ManifestFile) => f.type === 'Patient');
        if (patientFile) {
          console.log('Found patient data in manifest, triggering background cache.');
          fetch('/api/clinician/bulk-data/fetch-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileUrl: patientFile.url,
              fileType: patientFile.type,
            }),
          })
          .then(async (res) => {
            if (res.ok) {
              console.log('Patient data pre-cached successfully.');
              toast({
                title: "Data Synced",
                description: "Patient list has been updated in the background.",
              });
            } else {
              const errorData = await res.json();
              console.error('Failed to pre-cache patient data:', errorData.details);
            }
          })
          .catch(err => {
            console.error('Error during background patient data caching:', err);
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setJobStatus('error');
      setStatusUrl(null); // Stop polling on error
      toast({ title: "Polling Error", description: errorMessage, variant: "destructive" });
    }
  }, [statusUrl, toast]);

  useEffect(() => {
    if (jobStatus !== 'polling' || !statusUrl) {
      return;
    }

    const intervalId = setInterval(pollStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount or status change
  }, [jobStatus, statusUrl, pollStatus]);

  return (
    <DashboardLayout userType="clinician">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulk Data Export</h1>
          <p className="text-muted-foreground">Export system data in NDJSON format via the FHIR Bulk Data API.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Export Job Control</CardTitle>
            <CardDescription>Start a new job to export all patient data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartExport} disabled={jobStatus === 'starting' || jobStatus === 'polling'}>
              {(jobStatus === 'starting' || jobStatus === 'polling') && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {jobStatus === 'idle' || jobStatus === 'error' || jobStatus === 'complete' ? 'Start New Export' : 'Export in Progress...'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardContent>
            {jobStatus === 'idle' && <p>No active export job.</p>}
            {jobStatus === 'starting' && <p>Starting export job...</p>}
            {jobStatus === 'polling' && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Export in progress... {progress && `(${progress})`}</p>
              </div>
            )}
            {jobStatus === 'complete' && <p className="text-green-500">Export complete! See download links below.</p>}
            {jobStatus === 'error' && <p className="text-red-500">Error: {error}</p>}
          </CardContent>
        </Card>

        {manifest && jobStatus === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle>Download Files</CardTitle>
              <CardDescription>The following data files were generated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {manifest.output.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{file.type}.ndjson</p>
                      {file.count && <p className="text-sm text-muted-foreground">{file.count.toLocaleString()} records</p>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(file.url, file.type)}
                    disabled={!!downloadingUrl}
                  >
                    {downloadingUrl === file.url ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {downloadingUrl === file.url ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
