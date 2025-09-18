/**
 * API Route for creating patient conditions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { connectToDatabase } from '@/lib/mongodb';

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

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cachedConditions = await db.collection('data').find({
      resourceType: 'Condition',
      'subject.reference': `Patient/${patientId}`
    }).toArray();

    if (cachedConditions.length > 0) {
      console.log(`CACHE HIT: Found ${cachedConditions.length} conditions for patient ${patientId}.`);
      return NextResponse.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: cachedConditions.length,
        entry: cachedConditions.map(c => ({ resource: c }))
      });
    }

    console.log(`CACHE MISS: Conditions for patient ${patientId} not found. Fetching from API.`);
    const epicClient = new EpicFHIRClient('clinician');
    const conditions = await epicClient.getPatientConditions(accessToken, patientId);

    if (conditions.entry && conditions.entry.length > 0) {
      const conditionsToCache = conditions.entry.map((e: any) => e.resource);
      await db.collection('data').insertMany(conditionsToCache);
      console.log(`CACHE POPULATE: Stored ${conditionsToCache.length} conditions for patient ${patientId}.`);
    }

    return NextResponse.json(conditions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to search conditions', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const conditionData = await request.json();
    if (!conditionData || !conditionData.resourceType || conditionData.resourceType !== 'Condition') {
      return NextResponse.json({ error: 'Invalid Condition data' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newCondition = await epicClient.createCondition(accessToken, conditionData);

    // Add to cache
    const { db } = await connectToDatabase();
    await db.collection('data').insertOne(newCondition);
    console.log(`CACHE ADD: Added new condition ${newCondition.id} to cache.`);

    return NextResponse.json(newCondition, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create condition', details: errorMessage }, { status: 500 });
  }
}
