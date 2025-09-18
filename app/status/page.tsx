/**
 * Status Page - Shows Epic FHIR Integration Status
 * Displays configuration and connection status
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Globe, 
  Key,
  Settings,
  RefreshCw
} from 'lucide-react';

interface ConfigStatus {
  useMockData: boolean;
  hasClientId: boolean;
  hasEncryptionKey: boolean;
  hasValidRedirectUri: boolean;
  isAuthenticated: boolean;
  tokenExpiry?: number;
  patientId?: string;
  scopes?: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug');
      if (!response.ok) {
        throw new Error('Failed to fetch status from debug API.');
      }
      const data = await response.json();

      const session = data.session;
      const patientConfig = data.patientConfig;

      const configStatus: ConfigStatus = {
        useMockData: patientConfig.useMockData,
        hasClientId: !!patientConfig.clientId,
        hasEncryptionKey: patientConfig.hasEncryptionKey,
        hasValidRedirectUri: !!patientConfig.redirectUri,
        isAuthenticated: !!session,
        tokenExpiry: session?.expiresAt,
        patientId: session?.type === 'Patient' ? session.patientId : undefined,
        scopes: session?.scope
      };

      setStatus(configStatus);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? 'default' : 'destructive'}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">System Status</h1>
                <p className="text-sm text-muted-foreground">Epic FHIR Integration Status</p>
              </div>
            </div>
            
            <Button onClick={checkStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {status?.useMockData ? (
                <Database className="h-6 w-6 mr-2 text-blue-600" />
              ) : (
                <Globe className="h-6 w-6 mr-2 text-green-600" />
              )}
              Integration Mode
            </CardTitle>
            <CardDescription>
              Current Epic FHIR integration configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  {status?.useMockData ? 'Mock Data Mode' : 'Live Epic API Mode'}
                </h3>
                <p className="text-muted-foreground">
                  {status?.useMockData 
                    ? 'Using synthetic test data for development'
                    : 'Connected to Epic FHIR sandbox/production API'
                  }
                </p>
              </div>
              {getStatusBadge(
                !status?.useMockData, 
                'Live API', 
                'Mock Data'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Client ID</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.hasClientId || false)}
                  {getStatusBadge(
                    status?.hasClientId || false,
                    'Configured',
                    'Missing'
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Encryption Key</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.hasEncryptionKey || false)}
                  {getStatusBadge(
                    status?.hasEncryptionKey || false,
                    'Configured',
                    'Missing'
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Redirect URI</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.hasValidRedirectUri || false)}
                  {getStatusBadge(
                    status?.hasValidRedirectUri || false,
                    'Valid',
                    'Invalid'
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authentication Status</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.isAuthenticated || false)}
                  {getStatusBadge(
                    status?.isAuthenticated || false,
                    'Authenticated',
                    'Not Authenticated'
                  )}
                </div>
              </div>
              
              {status?.isAuthenticated && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Patient Context</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(!!status.patientId)}
                      <Badge variant="outline">
                        {status.patientId || 'No Patient'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Token Expiry</span>
                    <Badge variant="outline">
                      {status.tokenExpiry 
                        ? new Date(status.tokenExpiry).toLocaleString()
                        : 'Unknown'
                      }
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scopes and Permissions */}
        {status?.isAuthenticated && status.scopes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Granted Scopes</CardTitle>
              <CardDescription>
                Permissions granted by Epic for data access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {status.scopes.split(' ').map((scope, index) => (
                  <Badge key={index} variant="outline">
                    {scope}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status?.useMockData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Development Mode:</strong> You're currently using mock data. 
                    To connect to Epic's real API, configure your CLIENT_ID and set USE_MOCK_DATA=false.
                  </p>
                </div>
              )}
              
              {!status?.hasClientId && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>Missing Client ID:</strong> Register your application with Epic at 
                    <a href="https://fhir.epic.com/Developer" className="underline ml-1" target="_blank" rel="noopener noreferrer">
                      fhir.epic.com/Developer
                    </a>
                  </p>
                </div>
              )}
              
              {!status?.hasEncryptionKey && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">
                    <strong>Security Risk:</strong> No encryption key configured. 
                    Generate a secure 32-character key for PHI data encryption.
                  </p>
                </div>
              )}
              
              {!status?.isAuthenticated && status?.hasClientId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    <strong>Ready to Connect:</strong> Your configuration looks good. 
                    Try connecting to Epic MyChart to test the integration.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}