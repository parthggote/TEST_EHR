import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import CryptoJS from 'crypto-js'
import { connectToDatabase } from '@/lib/mongodb'

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

// Helper function to parse ndjson
function parseNdjson(ndjson: string): any[] {
  return ndjson
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line))
}

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 })
  }

  try {
    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const cacheCollection = db.collection('bulk_data_files')

    // Check cache first
    const cachedData = await cacheCollection.findOne({ fileUrl })
    if (cachedData) {
      console.log(`CACHE HIT: Returning data for ${fileUrl} from cache.`)
      return NextResponse.json(cachedData.data)
    }

    console.log(`CACHE MISS: Data for ${fileUrl} not found. Fetching from API.`)
    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/fhir+ndjson',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch bulk data file: ${response.status} ${errorText}`)
    }

    const ndjson = await response.text()
    const data = parseNdjson(ndjson)

    // Store in cache
    await cacheCollection.insertOne({
      fileUrl,
      data,
      createdAt: new Date(),
    })
    console.log(`CACHE POPULATE: Stored data for ${fileUrl}.`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch or parse bulk data file:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to process bulk data file', details: errorMessage },
      { status: 500 }
    )
  }
}
