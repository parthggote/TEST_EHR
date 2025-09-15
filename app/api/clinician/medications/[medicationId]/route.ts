/**
 * API Route for managing a single medication request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { MedicationRequest } from '@/lib/types/fhir';

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

interface RouteParams {
  params: {
    medicationId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    const medReq = await epicClient.getMedicationRequest(accessToken, params.medicationId);
    return NextResponse.json(medReq);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const medReqData: MedicationRequest = await request.json();
    if (medReqData.id !== params.medicationId) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedMedReq = await epicClient.updateMedicationRequest(accessToken, medReqData);
    return NextResponse.json(updatedMedReq);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication request' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deleteMedicationRequest(accessToken, params.medicationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication request' }, { status: 500 });
  }
}
