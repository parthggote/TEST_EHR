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
    const epicClient = new EpicFHIRClient('clinician');
    const patient = await epicClient.getPatient(accessToken, patientId);
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

    // Ensure the ID in the body matches the ID in the URL
    if (patientData.id !== patientId) {
      return NextResponse.json({ error: 'Patient ID in URL and body do not match' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedPatient = await epicClient.updatePatient(accessToken, patientData);

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

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete patient ${patientId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete patient', details: errorMessage }, { status: 500 });
  }
}
