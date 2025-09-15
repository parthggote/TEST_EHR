/**
 * Epic FHIR OAuth2 Callback Route
 * Handles authorization code exchange and token storage
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { EpicAuthState } from '@/lib/types/fhir';
import CryptoJS from 'crypto-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Log all callback parameters for debugging
    console.log('Auth callback received:', {
      hasCode: !!code,
      hasState: !!state,
      error,
      errorDescription,
      fullUrl: request.url
    });

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error from Epic:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_parameters', request.url)
      );
    }

    // Retrieve and validate auth state
    const cookieStore = cookies();
    const authStateCookie = cookieStore.get('epic_auth_state');
    
    if (!authStateCookie) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_state', request.url)
      );
    }

    let authState: EpicAuthState;
    try {
      authState = JSON.parse(authStateCookie.value);
    } catch {
      return NextResponse.redirect(
        new URL('/auth/error?error=invalid_state', request.url)
      );
    }

    // Validate state parameter
    if (authState.state !== state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=state_mismatch', request.url)
      );
    }

    // Check state expiration (10 minutes)
    if (Date.now() - authState.timestamp > 600000) {
      return NextResponse.redirect(
        new URL('/auth/error?error=state_expired', request.url)
      );
    }

    // Exchange authorization code for tokens
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    const tokenResponse = await epicClient.exchangeCodeForToken(code, authState);

    // Encrypt tokens for secure storage
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const encryptedAccessToken = CryptoJS.AES.encrypt(tokenResponse.access_token, encryptionKey).toString();
    const encryptedRefreshToken = tokenResponse.refresh_token 
      ? CryptoJS.AES.encrypt(tokenResponse.refresh_token, encryptionKey).toString()
      : null;

    // Store encrypted tokens in HTTP-only cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.set('epic_access_token', encryptedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in - 60, // Expire 1 minute before actual expiration
      path: '/'
    });

    if (encryptedRefreshToken) {
      response.cookies.set('epic_refresh_token', encryptedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    // Store patient context if available
    if (tokenResponse.patient) {
      response.cookies.set('epic_patient_id', tokenResponse.patient, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenResponse.expires_in - 60,
        path: '/'
      });
    }

    // Store token metadata
    response.cookies.set('epic_token_metadata', JSON.stringify({
      scope: tokenResponse.scope,
      expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      patientId: tokenResponse.patient,
      encounterId: tokenResponse.encounter
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in - 60,
      path: '/'
    });

    // Clear auth state cookie
    response.cookies.delete('epic_auth_state');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/error?error=token_exchange_failed&description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
  }
}