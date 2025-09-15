/**
 * FHIR Patients API Route
 * Handles patient search and retrieval operations
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import CryptoJS from 'crypto-js';

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

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('id');
    
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();

    if (patientId) {
      // Get specific patient
      const patient = await epicClient.getPatient(accessToken, patientId);
      return NextResponse.json(patient);
    } else {
      // Search patients
      const searchCriteria = {
        family: searchParams.get('family') || undefined,
        given: searchParams.get('given') || undefined,
        birthdate: searchParams.get('birthdate') || undefined,
        identifier: searchParams.get('identifier') || undefined
      };
      
      const bundle = await epicClient.searchPatients(accessToken, searchCriteria);
      return NextResponse.json(bundle);
    }
  } catch (error) {
    console.error('Patient API error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired or invalid' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch patient data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}