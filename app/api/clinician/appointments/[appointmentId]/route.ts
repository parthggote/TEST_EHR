/**
 * API Route for managing a single appointment.
 * - GET: Fetches a single appointment.
 * - PUT: Updates an existing appointment.
 * - DELETE: Cancels/deletes an appointment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { Appointment } from '@/lib/types/fhir';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to get and decrypt the access token
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
    appointmentId: string;
  };
}

// GET handler to fetch a single appointment
export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const cachedAppointment = await db.collection('data').findOne({ id: params.appointmentId, resourceType: 'Appointment' });

    if (cachedAppointment) {
      console.log(`CACHE HIT: Found appointment ${params.appointmentId} in cache.`);
      const { _id, ...appointment } = cachedAppointment;
      return NextResponse.json(appointment);
    }

    console.log(`CACHE MISS: Appointment ${params.appointmentId} not in cache. Fetching from API.`);
    const epicClient = new EpicFHIRClient('clinician');
    const appointment = await epicClient.getAppointment(accessToken, params.appointmentId);

    await db.collection('data').insertOne(appointment);

    return NextResponse.json(appointment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch appointment', details: errorMessage }, { status: 500 });
  }
}

// PUT handler to update an appointment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const appointmentData: Appointment = await request.json();
    if (appointmentData.id !== params.appointmentId) {
      return NextResponse.json({ error: 'Appointment ID in URL and body do not match' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const updatedAppointment = await epicClient.updateAppointment(accessToken, appointmentData);

    const { db } = await connectToDatabase();
    await db.collection('data').updateOne({ id: params.appointmentId }, { $set: updatedAppointment });
    console.log(`CACHE UPDATE: Updated appointment ${params.appointmentId} in cache.`);

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update appointment', details: errorMessage }, { status: 500 });
  }
}

// DELETE handler to delete an appointment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const epicClient = new EpicFHIRClient('clinician');
    await epicClient.deleteAppointment(accessToken, params.appointmentId);

    const { db } = await connectToDatabase();
    await db.collection('data').deleteOne({ id: params.appointmentId, resourceType: 'Appointment' });
    console.log(`CACHE INVALIDATE: Deleted appointment ${params.appointmentId} from cache.`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete appointment', details: errorMessage }, { status: 500 });
  }
}
