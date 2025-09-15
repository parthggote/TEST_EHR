/**
 * Epic FHIR Logout Route
 * Clears authentication tokens and session data
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Clear all Epic-related cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.delete('epic_access_token');
    response.cookies.delete('epic_refresh_token');
    response.cookies.delete('epic_patient_id');
    response.cookies.delete('epic_token_metadata');
    response.cookies.delete('epic_auth_state');
    
    // Log logout event for audit
    console.log('[AUDIT] USER_LOGOUT:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Clear cookies and redirect to home
    const response = NextResponse.redirect(new URL('/', request.url));
    
    response.cookies.delete('epic_access_token');
    response.cookies.delete('epic_refresh_token');
    response.cookies.delete('epic_patient_id');
    response.cookies.delete('epic_token_metadata');
    response.cookies.delete('epic_auth_state');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}