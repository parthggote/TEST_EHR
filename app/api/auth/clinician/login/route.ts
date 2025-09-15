/**
 * Clinician Epic FHIR OAuth2 Login Route
 * Initiates SMART on FHIR authorization flow for clinicians.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scopes = searchParams.get('scopes')?.split(',');

    // Instantiate the client for a clinician user
    const epicClient = new EpicFHIRClient('clinician');
    const { url, state } = epicClient.generateAuthUrl(scopes);

    // Store auth state securely in a clinician-specific HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('epic_clinician_auth_state', JSON.stringify(state), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    // Redirect to Epic authorization server
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Clinician login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate clinician login' },
      { status: 500 }
    );
  }
}
