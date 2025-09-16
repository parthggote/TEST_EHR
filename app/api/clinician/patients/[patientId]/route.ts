import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params
    const { db } = await connectToDatabase()

    // In a real app, you'd use the FHIR patient ID.
    // For this demo, the list page will link using the mongo _id for simplicity.
    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 })
    }

    const patient = await db.collection('patients').findOne({ _id: new ObjectId(patientId) })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // The patient's name is often used as the reference in other resources.
    const patientName = patient.name?.[0]?.text;

    // Fetch related data using the patient's name as a reference.
    // This is a simplification; a real FHIR system would use patient ID references.
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
