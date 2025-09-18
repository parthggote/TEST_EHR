/**
 * Debug API Route to test fetching a patient resource.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

function getSessionData(cookieName: string): any | null {
  const cookieStore = cookies();
  const encryptedSession = cookieStore.get(cookieName)?.value;
  if (!encryptedSession) return null;

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedSession, encryptionKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    return null;
  }
}

export async function GET() {
  const patientSession = getSessionData('epic_patient_session');

  if (!patientSession?.accessToken || !patientSession?.patientId) {
    return NextResponse.json(
      { success: false, message: 'No active patient session found to test with.' },
      { status: 401 }
    );
  }

  try {
    const epicClient = new EpicFHIRClient('patient');
    const patientResource = await epicClient.getPatient(
      patientSession.accessToken,
      patientSession.patientId
    );

    return NextResponse.json({ success: true, data: patientResource });

  } catch (error) {
    console.error('API Test Fetch Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patient data.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
