'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Copy, LogOut, Server, User, BriefcaseMedical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug');
      if (!response.ok) throw new Error('Failed to fetch debug info');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
      toast({ title: 'Error', description: 'Could not load debug information.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'URL copied to clipboard.' });
  };

  const logout = () => {
    const logoutUrl =
      debugInfo?.session?.type === 'Clinician'
        ? '/api/auth/clinician/logout'
        : '/api/auth/logout';
    window.location.href = logoutUrl;
  };

  const testPatientApi = async () => {
    try {
      const response = await fetch('/api/debug/test-patient-fetch');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API test failed');
      }
      toast({
        title: 'API Test Successful',
        description: `Successfully fetched data for Patient ID: ${data.data.id}`,
      });
      console.log('Test Patient API Response:', data);
    } catch (error) {
      toast({
        title: 'API Test Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const renderConfigValue = (value: any) => {
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Enabled' : 'Disabled'}
        </Badge>
      );
    }
    if (!value) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="max-w-48 truncate">
          {value}
        </Badge>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Epic FHIR Debug Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Troubleshoot your Epic integration configuration.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Live Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Live Session Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {debugInfo?.session ? (
                <>
                  <div className="flex justify-between">
                    <span>Session Type:</span>{' '}
                    <Badge>{debugInfo.session.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Authenticated:</span> {renderConfigValue(true)}
                  </div>
                  <div className="flex justify-between">
                    <span>Patient ID:</span>{' '}
                    {renderConfigValue(debugInfo.session.patientId)}
                  </div>
                  <div className="flex justify-between">
                    <span>Token Expiry:</span>{' '}
                    <Badge variant="outline">
                      {new Date(
                        debugInfo.session.expiresAt
                      ).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Access Token:</span>
                    <Badge variant="secondary" className="font-mono">
                      {debugInfo.session.accessToken}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Granted Scopes:</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-md">
                      {debugInfo.session.scope
                        ?.split(' ')
                        .map((s: string) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">
                  No active session found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseMedical className="h-5 w-5" />
                Clinician App Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Client ID:</span>{' '}
                {renderConfigValue(debugInfo?.clinicianConfig?.clientId)}
              </div>
              <div className="flex justify-between">
                <span>Redirect URI:</span>{' '}
                {renderConfigValue(debugInfo?.clinicianConfig?.redirectUri)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient App Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Client ID:</span>{' '}
                {renderConfigValue(debugInfo?.patientConfig?.clientId)}
              </div>
              <div className="flex justify-between">
                <span>Redirect URI:</span>{' '}
                {renderConfigValue(debugInfo?.patientConfig?.redirectUri)}
              </div>
              <div className="flex justify-between">
                <span>Mock Data Mode:</span>{' '}
                {renderConfigValue(debugInfo?.patientConfig?.useMockData)}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Patient Auth URL</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(debugInfo?.authUrls?.patient)
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <a
                    href={debugInfo?.authUrls?.patient}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>Test Patient Login</Button>
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Clinician Auth URL</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(debugInfo?.authUrls?.clinician)
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <a
                    href={debugInfo?.authUrls?.clinician}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>Test Clinician Login</Button>
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Clear Session</Label>
                <div>
                  <Button
                    variant="destructive"
                    onClick={logout}
                    disabled={!debugInfo?.session}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Test Patient API</Label>
                <div>
                  <Button
                    variant="secondary"
                    onClick={testPatientApi}
                    disabled={debugInfo?.session?.type !== 'Patient'}
                  >
                    Fetch Patient Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
