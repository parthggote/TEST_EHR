/**
 * API Route for creating medication requests.
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

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const medReqData = await request.json();
    if (!medReqData || !medReqData.resourceType || medReqData.resourceType !== 'MedicationRequest') {
      return NextResponse.json({ error: 'Invalid MedicationRequest data' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newMedReq = await epicClient.createMedicationRequest(accessToken, medReqData);

    return NextResponse.json(newMedReq, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create medication request', details: errorMessage }, { status: 500 });
  }
}
