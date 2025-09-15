/**
 * API Route for managing a single observation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { Observation } from '@/lib/types/fhir';

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
    observationId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    const observation = await epicClient.getObservation(accessToken, params.observationId);
    return NextResponse.json(observation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch observation' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const observationData: Observation = await request.json();
    if (observationData.id !== params.observationId) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedObservation = await epicClient.updateObservation(accessToken, observationData);
    return NextResponse.json(updatedObservation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update observation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deleteObservation(accessToken, params.observationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete observation' }, { status: 500 });
  }
}
