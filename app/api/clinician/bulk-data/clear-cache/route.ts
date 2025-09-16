import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// The list of collections that are populated by the bulk import.
const resourceCollections = [
  'patients',
  'appointments',
  'conditions',
  'medications',
  'allergies',
  'practitioners',
  'diagnosticreports',
  'immunizations',
  'observations',
  'documentreferences',
  'procedures',
]

export async function POST() {
  try {
    const { db } = await connectToDatabase()

    for (const collectionName of resourceCollections) {
      // A less safe but simple way to check if collection exists and drop it.
      // In a real app, you might want more careful handling.
      const collections = await db.listCollections({ name: collectionName }).toArray()
      if (collections.length > 0) {
        await db.collection(collectionName).drop()
        console.log(`Dropped collection: ${collectionName}`)
      }
    }

    return NextResponse.json({ message: 'Cache cleared successfully' })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to clear cache', details: errorMessage },
      { status: 500 }
    )
  }
}
