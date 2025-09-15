/**
 * API Route for managing a single immunization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { Immunization } from '@/lib/types/fhir';

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
    immunizationId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    const immunization = await epicClient.getImmunization(accessToken, params.immunizationId);
    return NextResponse.json(immunization);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch immunization' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const immunizationData: Immunization = await request.json();
    if (immunizationData.id !== params.immunizationId) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedImmunization = await epicClient.updateImmunization(accessToken, immunizationData);
    return NextResponse.json(updatedImmunization);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update immunization' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deleteImmunization(accessToken, params.immunizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete immunization' }, { status: 500 });
  }
}
