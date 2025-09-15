'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, User, Key, CheckCircle } from 'lucide-react';

export default function TestLoginPage() {
  const [step, setStep] = useState(1);

  const testCredentials = [
    { username: 'fhiruser', password: 'epicepic1', description: 'General test patient' },
    { username: 'fhirjason', password: 'epicepic1', description: 'Jason Argonaut (comprehensive data)' },
    { username: 'fhirnancy', password: 'epicepic1', description: 'Nancy Smart (female patient)' },
    { username: 'fhirderrick', password: 'epicepic1', description: 'Derrick Lin (pediatric patient)' }
  ];

  const startLogin = () => {
    setStep(2);
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Epic FHIR Test Login</h1>
          <p className="text-gray-600 mt-2">Step-by-step guide to test Epic integration</p>
        </div>

        <div className="grid gap-6">
          {/* Step 1: Test Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Step 1: Epic Test Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use these credentials on Epic's MyChart login page (not in your app):
              </p>
              <div className="grid gap-3">
                {testCredentials.map((cred, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cred.username}</Badge>
                        <span className="text-gray-400">/</span>
                        <Badge variant="outline">{cred.password}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{cred.description}</p>
                    </div>
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Login Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Step 2: Test Login Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">What will happen:</h4>
                  <ol className="list-decimal list-inside text-blue-700 space-y-1">
                    <li>Click "Start Epic Login Test" below</li>
                    <li>You'll be redirected to Epic's MyChart login page</li>
                    <li>Enter one of the test credentials above</li>
                    <li>Epic may ask for consent - click "Allow"</li>
                    <li>You'll be redirected back to your app dashboard</li>
                  </ol>
                </div>
                
                <Button onClick={startLogin} className="w-full" size="lg">
                  Start Epic Login Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800">If credentials don't work:</h4>
                  <ul className="list-disc list-inside text-yellow-700 mt-1 space-y-1">
                    <li>Try different test accounts (fhirjason, fhirnancy, etc.)</li>
                    <li>Check if your Epic app needs approval</li>
                    <li>Look for "Create Account" option on Epic's login page</li>
                  </ul>
                </div>
                
                <div className="p-3 border-l-4 border-red-400 bg-red-50">
                  <h4 className="font-semibold text-red-800">If you get errors:</h4>
                  <ul className="list-disc list-inside text-red-700 mt-1 space-y-1">
                    <li>Check browser console for error messages</li>
                    <li>Verify your Epic app registration</li>
                    <li>Ensure redirect URI matches exactly</li>
                  </ul>
                </div>
                
                <div className="p-3 border-l-4 border-green-400 bg-green-50">
                  <h4 className="font-semibold text-green-800">Success indicators:</h4>
                  <ul className="list-disc list-inside text-green-700 mt-1 space-y-1">
                    <li>Epic login page loads</li>
                    <li>Credentials are accepted</li>
                    <li>Redirected back to your app</li>
                    <li>Dashboard shows patient data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Links */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <a href="/api/epic-test" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    View Auth Config
                  </Button>
                </a>
                <a href="/debug" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Debug Console
                  </Button>
                </a>
                <a href="/status" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    App Status
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}