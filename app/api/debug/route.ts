/**
 * Debug API Route
 * Provides configuration information for troubleshooting
 */

import { NextResponse } from 'next/server';
import { getEpicConfig } from '@/lib/config';
import { EpicFHIRClient } from '@/lib/epic-client';

export async function GET() {
  try {
    const config = getEpicConfig();
    const epicClient = new EpicFHIRClient();
    const { url } = epicClient.generateAuthUrl();

    // Return safe configuration info (no sensitive data)
    return NextResponse.json({
      config: {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        authorizeUrl: config.authorizeUrl,
        baseUrl: config.baseUrl,
        useMockData: config.useMockData,
        hasEncryptionKey: !!config.encryptionKey && config.encryptionKey.length >= 32
      },
      authUrl: url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate debug info' },
      { status: 500 }
    );
  }
}