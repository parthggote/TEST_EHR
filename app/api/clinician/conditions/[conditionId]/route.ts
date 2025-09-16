/**
 * API Route for managing a single condition.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { Condition } from '@/lib/types/fhir';
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

interface RouteParams {
  params: {
    conditionId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const cachedCondition = await db.collection('data').findOne({ id: params.conditionId, resourceType: 'Condition' });

    if (cachedCondition) {
      console.log(`CACHE HIT: Found condition ${params.conditionId} in cache.`);
      const { _id, ...condition } = cachedCondition;
      return NextResponse.json(condition);
    }

    console.log(`CACHE MISS: Condition ${params.conditionId} not found. Fetching from API.`);
    const epicClient = new EpicFHIRClient('clinician');
    const condition = await epicClient.getCondition(accessToken, params.conditionId);
    await db.collection('data').insertOne(condition);
    return NextResponse.json(condition);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch condition' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const conditionData: Condition = await request.json();
    if (conditionData.id !== params.conditionId) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedCondition = await epicClient.updateCondition(accessToken, conditionData);

    const { db } = await connectToDatabase();
    await db.collection('data').updateOne({ id: params.conditionId }, { $set: updatedCondition });
    console.log(`CACHE UPDATE: Updated condition ${params.conditionId} in cache.`);

    return NextResponse.json(updatedCondition);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deleteCondition(accessToken, params.conditionId);

    const { db } = await connectToDatabase();
    await db.collection('data').deleteOne({ id: params.conditionId, resourceType: 'Condition' });
    console.log(`CACHE INVALIDATE: Deleted condition ${params.conditionId} from cache.`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete condition' }, { status: 500 });
  }
}
