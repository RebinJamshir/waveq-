import prisma from './prisma';

export const WAVE_SIZE_DEFAULT = 3;
export const OVERLAP_MINUTES_DEFAULT = 10;
export const WAVE_DURATION_MINUTES = 15;

export async function assignPatientToWave(sessionId: string, patientId: string) {
    // 1. Get current session details
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            waves: {
                orderBy: { startTime: 'desc' },
                include: { _count: { select: { patients: true } } }
            }
        }
    });

    if (!session) throw new Error('Session not found');

    const waveSize = session.waveSize || WAVE_SIZE_DEFAULT;
    const overlap = session.overlapMinutes || OVERLAP_MINUTES_DEFAULT;

    // 2. Check if the latest created wave has space
    let waveToAssign = null;
    const latestWave = session.waves[0]; // Since ordered by startTime desc

    if (latestWave && latestWave._count.patients < waveSize) {
        waveToAssign = latestWave;
    } else {
        // 3. Create new wave
        // Calculate start time
        let newStartTime: Date;
        let label = 'A';

        if (latestWave) {
            // Calculate next label (A -> B -> C...)
            const lastLabelCode = latestWave.waveLabel.charCodeAt(0);
            label = String.fromCharCode(lastLabelCode + 1);

            // Calculate time
            if (latestWave.startTime) {
                newStartTime = new Date(latestWave.startTime.getTime() + overlap * 60000);
            } else {
                // Fallback if previous wave has no time?
                newStartTime = new Date();
            }
        } else {
            // First wave
            newStartTime = new Date(); // Start immediately? Or session start time?
            // Assuming session start implies now or configured time.
        }

        const newEndTime = new Date(newStartTime.getTime() + WAVE_DURATION_MINUTES * 60000);

        waveToAssign = await prisma.wave.create({
            data: {
                sessionId,
                waveLabel: label,
                startTime: newStartTime,
                endTime: newEndTime,
                status: 'PENDING',
            }
        });
    }

    // 4. Update patient with waveId
    await prisma.patient.update({
        where: { id: patientId },
        data: { waveId: waveToAssign.id }
    });

    return waveToAssign;
}
