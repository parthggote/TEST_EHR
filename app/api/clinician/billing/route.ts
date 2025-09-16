/**
 * API Route for fetching billing information (ExplanationOfBenefit) for clinicians.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

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

export async function GET(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');

    // For a clinician portal, we might want to fetch for all patients if no specific patient is requested.
    // However, FHIR servers often require a patient context for this resource.
    // We will require a patientId for now, but this could be expanded later.
    // Or, we can fetch all if no patientId is provided, but this might be slow.
    // For now, let's just pass all params to the search function.
    const searchCriteria: { patient?: string; [key: string]: any } = {};
    searchParams.forEach((value, key) => {
      searchCriteria[key] = value;
    });

    const epicClient = new EpicFHIRClient('clinician');
    const searchResults = await epicClient.searchExplanationOfBenefit(accessToken, searchCriteria);

    return NextResponse.json(searchResults);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch billing data', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const chargeItemData = await request.json();

    if (!chargeItemData || !chargeItemData.resourceType || chargeItemData.resourceType !== 'ChargeItem') {
      return NextResponse.json({ error: 'Invalid ChargeItem data provided' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newChargeItem = await epicClient.createChargeItem(accessToken, chargeItemData);

    return NextResponse.json(newChargeItem, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create charge item', details: errorMessage }, { status: 500 });
  }
}
