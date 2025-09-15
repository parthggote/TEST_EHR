/**
 * Clinician Logout Route
 * Clears clinician-specific session cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();

    // Clear all clinician-related cookies
    cookieStore.delete('epic_clinician_access_token');
    cookieStore.delete('epic_clinician_refresh_token');
    cookieStore.delete('epic_clinician_fhir_user');
    cookieStore.delete('epic_clinician_token_metadata');

    // Redirect to the homepage
    const response = NextResponse.redirect(new URL('/', request.url));

    // Another way to clear cookies, just in case
    response.cookies.set('epic_clinician_access_token', '', { maxAge: -1 });
    response.cookies.set('epic_clinician_refresh_token', '', { maxAge: -1 });
    response.cookies.set('epic_clinician_fhir_user', '', { maxAge: -1 });
    response.cookies.set('epic_clinician_token_metadata', '', { maxAge: -1 });

    return response;
  } catch (error) {
    console.error('Clinician logout error:', error);
    return NextResponse.json(
      { error: 'Failed to log out clinician' },
      { status: 500 }
    );
  }
}
