import { NextResponse, NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// GET all patients from cache
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

// POST a new patient to the cache
export async function POST(request: NextRequest) {
  try {
    const patientData = await request.json()

    // Basic validation
    if (!patientData || !patientData.name || !patientData.birthDate || !patientData.gender) {
      return NextResponse.json({ error: 'Invalid patient data provided' }, { status: 400 });
    }

    const { db } = await connectToDatabase()

    // In a real app, you'd add more validation and cleaning here
    const result = await db.collection('patients').insertOne({
      ...patientData,
      resourceType: 'Patient', // Ensure resourceType is set
      id: `local-${new Date().getTime()}`, // Create a fake local ID
      createdAt: new Date(),
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Failed to create patient in cache:', error)
    return NextResponse.json(
      { error: 'Failed to create patient in cache' },
      { status: 500 }
    )
  }
}
