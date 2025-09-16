import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EpicFHIRClient } from '@/lib/epic-client'
import CryptoJS from 'crypto-js'

// Helper function to get and decrypt the access token
function getAccessToken(): string | null {
  const cookieStore = cookies()
  const encryptedToken = cookieStore.get('epic_clinician_access_token')?.value

  if (!encryptedToken) {
    return null
  }

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey)
    const accessToken = decryptedBytes.toString(CryptoJS.enc.Utf8)
    return accessToken
  } catch (error) {
    console.error('Failed to decrypt access token:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 })
  }

  try {
    const epicClient = new EpicFHIRClient('clinician')
    const groupId = 'e3iabhmS8rsueyz7vaimuiaSmfGvi.QwjVXJANlPOgR83'
    const statusUrl = await epicClient.kickOffBulkExport(accessToken, groupId)

    return NextResponse.json({ statusUrl })
  } catch (error) {
    console.error('Failed to start bulk export:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to start bulk export', details: errorMessage },
      { status: 500 }
    )
  }
}
