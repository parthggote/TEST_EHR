/**
 * EHR Dashboard Main Page
 * Secure HIPAA-compliant dashboard for Epic FHIR data
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  Activity, 
  Pill, 
  AlertTriangle, 
  FileText,
  LogOut,
  Shield,
  Clock
} from 'lucide-react';
import { Patient } from '@/lib/types/fhir';
import { useToast } from '@/hooks/use-toast';

interface TokenMetadata {
  scope: string;
  expiresAt: number;
  patientId?: string;
  encounterId?: string;
}

export default function DashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
    loadTokenMetadata();
  }, []);

  const loadTokenMetadata = async () => {
    try {
      // Token metadata is stored in a cookie, we'll need to get it via an API call
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setTokenMetadata(data);
      }
    } catch (error) {
      console.error('Failed to load token metadata:', error);
    }
  };

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the current patient from the token context
      const response = await fetch('/api/fhir/patients');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          window.location.href = '/api/auth/login';
          return;
        }
        throw new Error(`Failed to fetch patient data: ${response.status}`);
      }

      const bundle = await response.json();
      
      // If we have a specific patient ID from the token, get that patient
      // Otherwise, this might be a provider context where we need to search
      if (bundle.resourceType === 'Patient') {
        setPatient(bundle);
      } else if (bundle.entry && bundle.entry.length > 0) {
        // Take the first patient from search results
        setPatient(bundle.entry[0].resource);
      } else {
        setError('No patient data available in current context');
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load patient data');
      toast({
        title: 'Error',
        description: 'Failed to load patient data. Please try refreshing the page.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout properly',
        variant: 'destructive'
      });
    }
  };

  const formatPatientName = (patient: Patient): string => {
    if (!patient.name || patient.name.length === 0) return 'Unknown Patient';
    
    const name = patient.name.find(n => n.use === 'official') || patient.name[0];
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown Patient';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getTokenExpirationStatus = (): { status: 'valid' | 'expiring' | 'expired'; timeLeft: string } => {
    if (!tokenMetadata) return { status: 'expired', timeLeft: 'Unknown' };
    
    const now = Date.now();
    const expiresAt = tokenMetadata.expiresAt;
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) {
      return { status: 'expired', timeLeft: 'Expired' };
    } else if (timeLeft <= 300000) { // 5 minutes
      return { status: 'expiring', timeLeft: `${Math.floor(timeLeft / 60000)} minutes` };
    } else {
      return { status: 'valid', timeLeft: `${Math.floor(timeLeft / 60000)} minutes` };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadPatientData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tokenStatus = getTokenExpirationStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EHR Integration Dashboard</h1>
                <p className="text-sm text-gray-500">Epic FHIR • HIPAA Compliant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Token Status */}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <Badge 
                  variant={tokenStatus.status === 'valid' ? 'default' : tokenStatus.status === 'expiring' ? 'secondary' : 'destructive'}
                >
                  {tokenStatus.timeLeft}
                </Badge>
              </div>
              
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        {patient && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{formatPatientName(patient)}</CardTitle>
                  <CardDescription>
                    {patient.gender && (
                      <span className="capitalize">{patient.gender}</span>
                    )}
                    {patient.birthDate && (
                      <span> • Born {formatDate(patient.birthDate)}</span>
                    )}
                    {patient.id && (
                      <span> • ID: {patient.id}</span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Data</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Conditions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Medications</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Known Allergies</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your Epic MyChart</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Clinical data will be loaded here</p>
                  <p className="text-sm">Use the tabs above to explore different data types</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>View and manage your appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Appointment data will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinical">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Data</CardTitle>
                <CardDescription>Vitals, lab results, and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Clinical data will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medications</CardTitle>
                <CardDescription>Current and past medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Medication data will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allergies">
            <Card>
              <CardHeader>
                <CardTitle>Allergies & Intolerances</CardTitle>
                <CardDescription>Known allergies and adverse reactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Allergy data will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate reports and view analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Reporting features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}