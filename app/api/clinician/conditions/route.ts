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
    const collection = db.collection('data');

    try {
      // Fetch-first approach
      console.log(`Fetching fresh conditions for patient ${patientId} from API.`);
      const epicClient = new EpicFHIRClient('clinician');
      const freshConditions = await epicClient.getPatientConditions(accessToken, patientId);

      if (freshConditions.entry && freshConditions.entry.length > 0) {
        const conditionsToCache = freshConditions.entry.map((e: any) => e.resource);

        // Update cache: delete old and insert new
        await collection.deleteMany({
          resourceType: 'Condition',
          'subject.reference': `Patient/${patientId}`
        });
        await collection.insertMany(conditionsToCache);
        console.log(`CACHE REFRESH: Stored ${conditionsToCache.length} conditions for patient ${patientId}.`);
      } else {
         // If no conditions are returned, clear the cache for that patient
         await collection.deleteMany({
          resourceType: 'Condition',
          'subject.reference': `Patient/${patientId}`
        });
      }

      return NextResponse.json(freshConditions);

    } catch (fetchError) {
      console.warn(`API fetch failed for patient ${patientId}. Serving from cache as fallback. Error:`, fetchError);

      const cachedConditions = await collection.find({
        resourceType: 'Condition',
        'subject.reference': `Patient/${patientId}`
      }).toArray();

      if (cachedConditions.length > 0) {
        console.log(`CACHE FALLBACK: Found ${cachedConditions.length} conditions for patient ${patientId}.`);
        return NextResponse.json({
          resourceType: 'Bundle',
          type: 'searchset',
          total: cachedConditions.length,
          entry: cachedConditions.map(c => ({ resource: c }))
        });
      }

      // If fetch fails and cache is empty, re-throw the original error
      throw fetchError;
    }
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
