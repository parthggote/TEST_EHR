import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET a single patient and their related data from cache
export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params
    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 })
    }

    const patient = await db.collection('patients').findOne({ _id: new ObjectId(patientId) })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patientName = patient.name?.[0]?.text;

    const appointments = await db.collection('appointments').find({ 'participant.actor.display': patientName }).toArray()
    const conditions = await db.collection('conditions').find({ 'subject.display': patientName }).toArray()
    const medications = await db.collection('medicationrequests').find({ 'subject.display': patientName }).toArray()
    const allergies = await db.collection('allergyintolerances').find({ 'patient.display': patientName }).toArray()
    const immunizations = await db.collection('immunizations').find({ 'patient.display': patientName }).toArray()
    const diagnosticReports = await db.collection('diagnosticreports').find({ 'subject.display': patientName }).toArray()
    const procedures = await db.collection('procedures').find({ 'subject.display': patientName }).toArray()

    const response = {
      patient,
      appointments,
      conditions,
      medications,
      allergies,
      immunizations,
      diagnosticReports,
      procedures,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch patient details from cache:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient details from cache' },
      { status: 500 }
    )
  }
}

// PUT (update) a patient in the cache
export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params
    const patientData = await request.json()

    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 })
    }

    // Remove _id from the update payload to avoid errors
    const { _id, ...updateData } = patientData;

    const { db } = await connectToDatabase()
    const result = await db.collection('patients').updateOne(
      { _id: new ObjectId(patientId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Patient updated successfully' })
  } catch (error) {
    console.error('Failed to update patient in cache:', error)
    return NextResponse.json(
      { error: 'Failed to update patient in cache' },
      { status: 500 }
    )
  }
}

// DELETE a patient from the cache
export async function DELETE(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params

    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection('patients').deleteOne({ _id: new ObjectId(patientId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Failed to delete patient from cache:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient from cache' },
      { status: 500 }
    )
  }
}
