/**
 * Clinician Epic FHIR OAuth2 Callback Route
 * Handles authorization code exchange and token storage for clinicians.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicAuthState } from '@/lib/types/fhir';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('Clinician OAuth error from Epic:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_parameters', request.url)
      );
    }

    const cookieStore = cookies();
    const authStateCookie = cookieStore.get('epic_clinician_auth_state');

    if (!authStateCookie) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_clinician_state', request.url)
      );
    }

    let authState: EpicAuthState;
    try {
      authState = JSON.parse(authStateCookie.value);
    } catch {
      return NextResponse.redirect(
        new URL('/auth/error?error=invalid_clinician_state', request.url)
      );
    }

    if (authState.state !== state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=clinician_state_mismatch', request.url)
      );
    }

    if (Date.now() - authState.timestamp > 600000) {
      return NextResponse.redirect(
        new URL('/auth/error?error=clinician_state_expired', request.url)
      );
    }

    const epicClient = new EpicFHIRClient('clinician');
    const tokenResponse = await epicClient.exchangeCodeForToken(code, authState);

    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const encryptedAccessToken = CryptoJS.AES.encrypt(tokenResponse.access_token, encryptionKey).toString();
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? CryptoJS.AES.encrypt(tokenResponse.refresh_token, encryptionKey).toString()
      : null;

    const response = NextResponse.redirect(new URL('/dashboard/clinician', request.url));

    response.cookies.set('epic_clinician_access_token', encryptedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in - 60,
      path: '/'
    });

    if (encryptedRefreshToken) {
      response.cookies.set('epic_clinician_refresh_token', encryptedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
    }

    // The token response for a user-level login contains `fhirUser` instead of `patient`
    if (tokenResponse.fhirUser) {
      response.cookies.set('epic_clinician_fhir_user', tokenResponse.fhirUser, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenResponse.expires_in - 60,
        path: '/'
      });
    }

    response.cookies.set('epic_clinician_token_metadata', JSON.stringify({
      scope: tokenResponse.scope,
      expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      fhirUser: tokenResponse.fhirUser,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in - 60,
      path: '/'
    });

    response.cookies.delete('epic_clinician_auth_state');

    return response;
  } catch (error) {
    console.error('Clinician callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/error?error=clinician_token_exchange_failed&description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
  }
}
