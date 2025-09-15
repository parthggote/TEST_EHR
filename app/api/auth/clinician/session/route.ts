/**
 * Clinician Session Route
 * Provides information about the current clinician's session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const metadataCookie = cookieStore.get('epic_clinician_token_metadata');

    if (!metadataCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(metadataCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session format' }, { status: 500 });
    }

    // Check if the token is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      // Optionally, you could try a token refresh here in the future
      return NextResponse.json({ authenticated: false, reason: 'expired' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      ...session
    });

  } catch (error) {
    console.error('Clinician session error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve clinician session' },
      { status: 500 }
    );
  }
}
