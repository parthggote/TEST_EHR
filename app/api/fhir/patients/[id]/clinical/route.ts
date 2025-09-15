/**
 * FHIR Patient Clinical Data API Route
 * Handles clinical data retrieval (observations, conditions, medications, allergies)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid access token' },
        { status: 401 }
      );
    }

    const patientId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const dataType = searchParams.get('type'); // observations, conditions, medications, allergies, all
    
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    
    const clinicalData: any = {};

    try {
      if (!dataType || dataType === 'all' || dataType === 'observations') {
        const observationParams = {
          category: searchParams.get('category') || undefined,
          code: searchParams.get('code') || undefined,
          date: searchParams.get('date') || undefined
        };
        clinicalData.observations = await epicClient.getPatientObservations(
          accessToken, 
          patientId, 
          observationParams
        );
      }

      if (!dataType || dataType === 'all' || dataType === 'conditions') {
        clinicalData.conditions = await epicClient.getPatientConditions(accessToken, patientId);
      }

      if (!dataType || dataType === 'all' || dataType === 'medications') {
        clinicalData.medications = await epicClient.getPatientMedications(accessToken, patientId);
      }

      if (!dataType || dataType === 'all' || dataType === 'allergies') {
        clinicalData.allergies = await epicClient.getPatientAllergies(accessToken, patientId);
      }

      // If specific type requested, return just that data
      if (dataType && dataType !== 'all') {
        return NextResponse.json(clinicalData[dataType] || {});
      }

      // Return all clinical data
      return NextResponse.json(clinicalData);
    } catch (error) {
      // Handle partial failures - return what we could fetch
      console.warn('Partial clinical data fetch failure:', error);
      return NextResponse.json({
        ...clinicalData,
        warnings: [`Failed to fetch some clinical data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  } catch (error) {
    console.error('Clinical data API error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired or invalid' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch clinical data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}