/**
 * Session API Route
 * Returns current authentication session information
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Check if user has valid tokens
    const accessToken = cookieStore.get('epic_access_token');
    const tokenMetadata = cookieStore.get('epic_token_metadata');
    const patientId = cookieStore.get('epic_patient_id');
    
    if (!accessToken || !tokenMetadata) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    try {
      const metadata = JSON.parse(tokenMetadata.value);
      
      return NextResponse.json({
        authenticated: true,
        scope: metadata.scope,
        expiresAt: metadata.expiresAt,
        patientId: metadata.patientId || patientId?.value,
        encounterId: metadata.encounterId
      });
    } catch {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}