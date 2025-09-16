/**
 * API Route for searching patients from the clinician portal.
 *
 * Handles GET requests to search for patients using various criteria.
 * This route is protected by the middleware, ensuring only authenticated
 * clinicians can access it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

// Helper function to get and decrypt the access token
function getAccessToken(): string | null {
  const cookieStore = cookies();
  const encryptedToken = cookieStore.get('epic_clinician_access_token')?.value;

  if (!encryptedToken) {
    return null;
  }

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey);
    const accessToken = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return accessToken;
  } catch (error) {
    console.error("Failed to decrypt access token:", error);
    return null;
  }
}

import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('_fetchAll') === 'true';

    if (fetchAll) {
      const { db } = await connectToDatabase();
      const cacheCollection = db.collection('bulk_data_files');

      const patientDataCache = await cacheCollection.findOne(
        { fileType: 'Patient' },
        { sort: { createdAt: -1 } }
      );

      if (patientDataCache && Array.isArray(patientDataCache.data)) {
        const patients = patientDataCache.data;
        return NextResponse.json({ entry: patients.map(p => ({ resource: p })) });
      } else {
        // No patient data in cache, return empty list
        return NextResponse.json({ entry: [] });
      }
    }

    // Existing search logic for single-page results from live API
    const searchCriteria = {
      family: searchParams.get('family') || undefined,
      given: searchParams.get('given') || undefined,
      birthdate: searchParams.get('birthdate') || undefined,
      identifier: searchParams.get('identifier') || undefined,
      _count: searchParams.get('_count') || '10', // Default to 10 results
    };

    const epicClient = new EpicFHIRClient('clinician');
    const searchResults = await epicClient.searchPatients(accessToken, searchCriteria);

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Failed to search or fetch patients:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process patient request', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 });
  }

  try {
    const patientData = await request.json();

    // Basic validation
    if (!patientData || typeof patientData !== 'object' || !patientData.resourceType) {
      return NextResponse.json({ error: 'Invalid patient data provided' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newPatient = await epicClient.createPatient(accessToken, patientData);

    return NextResponse.json(newPatient, { status: 201 });

  } catch (error) {
    console.error('Failed to create patient:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create patient', details: errorMessage }, { status: 500 });
  }
}
