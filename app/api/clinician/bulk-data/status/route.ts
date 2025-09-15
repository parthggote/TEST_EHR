/**
 * API Route to check the status of a bulk data export job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

function getAccessToken(): string | null {
  const cookieStore = cookies();
  const encryptedToken = cookieStore.get('epic_clinician_access_token')?.value;
  if (!encryptedToken) return null;
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    return CryptoJS.AES.decrypt(encryptedToken, encryptionKey).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Failed to decrypt access token:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusUrl = searchParams.get('url');

  if (!statusUrl) {
    return NextResponse.json({ error: 'Missing status URL parameter' }, { status: 400 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    const statusResponse = await epicClient.checkBulkExportStatus(accessToken, statusUrl);

    return NextResponse.json(statusResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to check bulk export status', details: errorMessage }, { status: 500 });
  }
}
