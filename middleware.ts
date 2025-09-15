import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define the protected clinician routes
  const isClinicianDashboardRoute = pathname.startsWith('/dashboard/clinician');
  const isClinicianApiRoute = pathname.startsWith('/api/clinician');

  // If the route is not a protected clinician route, do nothing.
  if (!isClinicianDashboardRoute && !isClinicianApiRoute) {
    return NextResponse.next();
  }

  // Check for the clinician session cookie
  const sessionCookie = request.cookies.get('epic_clinician_access_token');
  const metadataCookie = request.cookies.get('epic_clinician_token_metadata');

  // If either cookie is missing, the user is not authenticated as a clinician.
  if (!sessionCookie || !metadataCookie) {
    // For API routes, return a 401 Unauthorized error.
    if (isClinicianApiRoute) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // For dashboard routes, redirect to the home page to log in.
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // A more advanced check could be to parse the metadata and check the expiry time.
  try {
    const metadata = JSON.parse(metadataCookie.value);
    if (metadata.expiresAt && Date.now() > metadata.expiresAt) {
      // Token is expired, treat as unauthenticated.
      if (isClinicianApiRoute) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Session expired' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(url);
    }
  } catch (e) {
    // Invalid metadata, treat as unauthenticated.
    console.error("Error parsing clinician metadata cookie:", e);
    if (isClinicianApiRoute) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid session' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }


  // If the cookie exists and is not expired, allow the request to proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/clinician/:path*',
    '/api/clinician/:path*',
  ],
}
