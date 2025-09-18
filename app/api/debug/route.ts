/**
 * Debug API Route
 * Provides configuration and live session information for troubleshooting
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getEpicConfig } from '@/lib/config';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

// Helper to safely decrypt session data
function getSessionData(cookieName: string): any | null {
  const cookieStore = cookies();
  const encryptedSession = cookieStore.get(cookieName)?.value;
  if (!encryptedSession) return null;

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    if (!encryptionKey) {
      console.error('Debug API: ENCRYPTION_KEY is not set.');
      return { error: 'Server is missing ENCRYPTION_KEY.' };
    }
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedSession, encryptionKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error(`Debug API: Failed to decrypt ${cookieName}:`, error);
    return { error: `Failed to decrypt ${cookieName}.` };
  }
}

export async function GET() {
  try {
    const patientConfig = getEpicConfig('patient');
    const clinicianConfig = getEpicConfig('clinician');

    const patientClient = new EpicFHIRClient('patient');
    const clinicianClient = new EpicFHIRClient('clinician');

    const { url: patientAuthUrl } = patientClient.generateAuthUrl();
    const { url: clinicianAuthUrl } = clinicianClient.generateAuthUrl();

    // Check for both patient and clinician sessions
    const patientSession = getSessionData('epic_patient_session');
    const clinicianSession = getSessionData('epic_clinician_session');

    let activeSession = null;
    if (clinicianSession && !clinicianSession.error) {
      activeSession = {
        type: 'Clinician',
        ...clinicianSession,
        accessToken: clinicianSession.accessToken ? `${clinicianSession.accessToken.substring(0, 15)}...` : 'Not found',
      };
    } else if (patientSession && !patientSession.error) {
      activeSession = {
        type: 'Patient',
        ...patientSession,
        accessToken: patientSession.accessToken ? `${patientSession.accessToken.substring(0, 15)}...` : 'Not found',
      };
    }

    return NextResponse.json({
      patientConfig: {
        clientId: patientConfig.clientId,
        redirectUri: patientConfig.redirectUri,
        useMockData: patientConfig.useMockData,
        hasEncryptionKey: !!patientConfig.encryptionKey && patientConfig.encryptionKey.length >= 32,
      },
      clinicianConfig: {
        clientId: clinicianConfig.clientId,
        redirectUri: clinicianConfig.redirectUri,
      },
      authUrls: {
        patient: patientAuthUrl,
        clinician: clinicianAuthUrl,
      },
      session: activeSession,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate debug info', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}