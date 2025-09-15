/**
 * FHIR DiagnosticReports API Route
 * Handles fetching diagnostic reports for a specific patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import CryptoJS from 'crypto-js';
import { EpicFHIRClient } from '@/lib/epic-client';

export const dynamic = 'force-dynamic';

async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const encryptedToken = cookieStore.get('epic_access_token')?.value;

  if (!encryptedToken) return null;

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, encryptionKey).toString(CryptoJS.enc.Utf8);
    return decryptedToken;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid access token' },
        { status: 401 }
      );
    }

    const patientId = request.nextUrl.searchParams.get('patient');
    if (!patientId) {
      return NextResponse.json(
        { error: 'Bad Request - patient ID is required' },
        { status: 400 }
      );
    }

    const epicClient = new EpicFHIRClient();
    const bundle = await epicClient.getPatientDiagnosticReports(accessToken, patientId);

    return NextResponse.json(bundle);
  } catch (error) {
    console.error('DiagnosticReports API error:', error);

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch diagnostic report data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
