/**
 * Authentication Error Page
 * Displays OAuth2 authentication errors with user-friendly messages
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, { title: string; description: string; canRetry: boolean }> = {
  access_denied: {
    title: 'Access Denied',
    description: 'You denied access to your Epic MyChart account. To use this application, you need to grant the necessary permissions.',
    canRetry: true
  },
  invalid_request: {
    title: 'Invalid Request',
    description: 'The authentication request was invalid. This might be a configuration issue.',
    canRetry: true
  },
  unauthorized_client: {
    title: 'Unauthorized Client',
    description: 'This application is not authorized to access Epic FHIR data. Please contact your administrator.',
    canRetry: false
  },
  unsupported_response_type: {
    title: 'Unsupported Response Type',
    description: 'The authentication method is not supported. This is likely a configuration issue.',
    canRetry: false
  },
  invalid_scope: {
    title: 'Invalid Scope',
    description: 'The requested permissions are not valid or not available.',
    canRetry: false
  },
  server_error: {
    title: 'Server Error',
    description: 'Epic\'s authentication server encountered an error. Please try again later.',
    canRetry: true
  },
  temporarily_unavailable: {
    title: 'Service Temporarily Unavailable',
    description: 'Epic\'s authentication service is temporarily unavailable. Please try again later.',
    canRetry: true
  },
  missing_parameters: {
    title: 'Missing Parameters',
    description: 'Required authentication parameters are missing. Please try logging in again.',
    canRetry: true
  },
  missing_state: {
    title: 'Missing State',
    description: 'Authentication state is missing. This might be due to an expired session.',
    canRetry: true
  },
  invalid_state: {
    title: 'Invalid State',
    description: 'Authentication state is invalid. This might be due to a security issue.',
    canRetry: true
  },
  state_mismatch: {
    title: 'State Mismatch',
    description: 'Authentication state doesn\'t match. This is a security measure to prevent attacks.',
    canRetry: true
  },
  state_expired: {
    title: 'State Expired',
    description: 'Authentication session has expired. Please try logging in again.',
    canRetry: true
  },
  token_exchange_failed: {
    title: 'Token Exchange Failed',
    description: 'Failed to exchange authorization code for access token. Please try again.',
    canRetry: true
  }
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown_error';
  const description = searchParams.get('description');
  
  const errorInfo = errorMessages[error] || {
    title: 'Authentication Error',
    description: description || 'An unknown error occurred during authentication.',
    canRetry: true
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-gray-600">
              {errorInfo.description}
            </CardDescription>
            {description && description !== errorInfo.description && (
              <CardDescription className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                {description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              {errorInfo.canRetry && (
                <Link href="/api/auth/login" passHref className="w-full">
                  <Button className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </Link>
              )}
              <Link href="/" passHref className="w-full">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact your system administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}