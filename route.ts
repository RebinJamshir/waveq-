import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { assignPatientToWave } from '@/lib/wave-utils';
import { pusherServer } from '@/lib/pusher';
import { sendWaveNotification } from '@/lib/twilio';

export async function POST(req: Request) {
    try {
        const { name, phone } = await req.json();

        // Get active session
        let session = await prisma.session.findFirst({
            where: {
                status: { in: ['ACTIVE', 'PAUSED'] },
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                waves: { orderBy: { startTime: 'desc' } }
            }
        });

        if (!session) {
            // Create new session if none exists for today? Or error?
            // For demo, let's auto-create one.
            const doctor = await prisma.doctor.findFirst();
            if (!doctor) {
                return NextResponse.json({ error: 'No doctor available to start session' }, { status: 400 });
            }

            session = await prisma.session.create({
                data: {
                    doctorId: doctor.id,
                    date: new Date(),
                    status: 'ACTIVE'
                },
                include: { waves: true }
            });
        }

        // Get next token number
        const lastPatient = await prisma.patient.findFirst({
            where: { sessionId: session.id },
            orderBy: { tokenNumber: 'desc' }
        });
        const nextToken = (lastPatient?.tokenNumber || 0) + 1;

        // Create patient
        const patient = await prisma.patient.create({
            data: {
                name,
                phone,
                tokenNumber: nextToken,
                sessionId: session.id,
                status: 'WAITING',
            }
        });

        // Assign to wave
        const wave = await assignPatientToWave(session.id, patient.id);

        // Trigger Pusher update
        await pusherServer.trigger('queue-updates', 'patient-added', {
            patient,
            wave
        });

        // Send SMS 
        if (phone) {
            // format wave time
            const timeString = wave.startTime ? new Date(wave.startTime).toLocaleTimeString() : 'Pending';
            // await sendWaveNotification(phone, patient.tokenNumber.toString(), timeString);
            // Commented out to prevent accidental usage in dev without valid credentials
        }

        return NextResponse.json({ patient, wave });
    } catch (error) {
        console.error('Error registering patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
