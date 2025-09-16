/**
 * API Route for reading and updating a single patient record.
 *
 * - GET: Fetches a single patient by their ID.
 * - PUT: Updates an existing patient's record.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { Patient } from '@/lib/types/fhir';
import { connectToDatabase } from '@/lib/mongodb';

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
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Failed to decrypt access token:", error);
    return null;
  }
}

interface RouteParams {
  params: {
    patientId: string;
  };
}

// GET handler to fetch a single patient
export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { patientId } = params;
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const cachedPatient = await db.collection('data').findOne({ id: patientId, resourceType: 'Patient' });

    if (cachedPatient) {
      console.log(`CACHE HIT: Found patient ${patientId} in cache.`);
      // The _id field is added by MongoDB, remove it before sending to the client
      const { _id, ...patient } = cachedPatient;
      return NextResponse.json(patient);
    }

    console.log(`CACHE MISS: Patient ${patientId} not found in cache. Fetching from API.`);
    const epicClient = new EpicFHIRClient('clinician');
    const patient = await epicClient.getPatient(accessToken, patientId);

    // Store in cache for future requests
    await db.collection('data').insertOne({ ...patient, id: patientId });

    return NextResponse.json(patient);
  } catch (error) {
    console.error(`Failed to fetch patient ${patientId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch patient', details: errorMessage }, { status: 500 });
  }
}

// PUT handler to update a patient
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { patientId } = params;
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const patientData: Patient = await request.json();

    if (patientData.id !== patientId) {
      return NextResponse.json({ error: 'Patient ID in URL and body do not match' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedPatient = await epicClient.updatePatient(accessToken, patientData);

    // Update cache
    const { db } = await connectToDatabase();
    await db.collection('data').updateOne({ id: patientId, resourceType: 'Patient' }, { $set: updatedPatient }, { upsert: true });
    console.log(`CACHE UPDATE: Updated patient ${patientId} in cache.`);

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error(`Failed to update patient ${patientId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update patient', details: errorMessage }, { status: 500 });
  }
}

// DELETE handler to delete a patient
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { patientId } = params;
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deletePatient(accessToken, patientId);

    // Invalidate cache
    const { db } = await connectToDatabase();
    await db.collection('data').deleteOne({ id: patientId, resourceType: 'Patient' });
    console.log(`CACHE INVALIDATE: Deleted patient ${patientId} from cache.`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete patient ${patientId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete patient', details: errorMessage }, { status: 500 });
  }
}
