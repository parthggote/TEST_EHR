/**
 * API Route for searching and creating appointments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';

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

// Search for appointments
export async function GET(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required for searching appointments' }, { status: 400 });
    }

    const searchOptions = {
      date: searchParams.get('date') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const epicClient = new EpicFHIRClient('clinician');
    const appointments = await epicClient.getPatientAppointments(accessToken, patientId, searchOptions);

    return NextResponse.json(appointments);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to search appointments', details: errorMessage }, { status: 500 });
  }
}

// Create a new appointment
export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const appointmentData = await request.json();
    if (!appointmentData || !appointmentData.resourceType) {
      return NextResponse.json({ error: 'Invalid appointment data' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newAppointment = await epicClient.createAppointment(accessToken, appointmentData);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create appointment', details: errorMessage }, { status: 500 });
  }
}
