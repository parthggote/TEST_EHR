'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';

export default function DebugPage() {
  const [config, setConfig] = useState<any>(null);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setConfig(data.config);
      setAuthUrl(data.authUrl);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testAuth = () => {
    window.location.href = '/api/auth/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Epic FHIR Debug Console</h1>
          <p className="text-gray-600 mt-2">Troubleshoot your Epic integration configuration</p>
        </div>

        <div className="grid gap-6">
          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Configuration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Client ID</span>
                  <div className="flex items-center gap-2">
                    {config?.clientId ? (
                      <>
                        <Badge variant="secondary">{config.clientId.substring(0, 8)}...</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Redirect URI</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="max-w-48 truncate">
                      {config?.redirectUri || 'Not set'}
                    </Badge>
                    {config?.redirectUri ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Mock Data Mode</span>
                  <Badge variant={config?.useMockData ? "secondary" : "default"}>
                    {config?.useMockData ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">Encryption Key</span>
                  <div className="flex items-center gap-2">
                    {config?.hasEncryptionKey ? (
                      <>
                        <Badge variant="secondary">Set</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth URL Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Auth URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm break-all">
                  {authUrl}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(authUrl)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button onClick={testAuth}>
                    Test Authentication
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Common Redirect Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800">Redirect URI Mismatch</h4>
                  <p className="text-yellow-700 mt-1">
                    Your redirect URI must exactly match what you registered in Epic. Check for:
                  </p>
                  <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                    <li>HTTP vs HTTPS</li>
                    <li>Port numbers (3000 vs 3001)</li>
                    <li>Trailing slashes</li>
                    <li>Case sensitivity</li>
                  </ul>
                </div>

                <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                  <h4 className="font-semibold text-blue-800">Current Redirect URI</h4>
                  <p className="text-blue-700 mt-1 font-mono">
                    {config?.redirectUri}
                  </p>
                  <p className="text-blue-700 mt-2">
                    Make sure this exactly matches your Epic app registration.
                  </p>
                </div>

                <div className="p-4 border-l-4 border-red-400 bg-red-50">
                  <h4 className="font-semibold text-red-800">State Parameter Issues</h4>
                  <p className="text-red-700 mt-1">
                    If you see "state_mismatch" or "state_expired" errors, try:
                  </p>
                  <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                    <li>Clear your browser cookies</li>
                    <li>Complete the auth flow within 10 minutes</li>
                    <li>Don't refresh the page during auth</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}