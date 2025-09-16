import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const patients = await db.collection('patients').find({}).toArray()
    return NextResponse.json(patients)
  } catch (error) {
    console.error('Failed to fetch patients from cache:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients from cache' },
      { status: 500 }
    )
  }
}
