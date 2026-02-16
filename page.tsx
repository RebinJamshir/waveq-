import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function PatientTokenPage({ params }: { params: { id: string } }) {
    const token = params.id;

    // Find patient by token number? 
    // Wait, URL is /token/[id]. Is id the UUID or the Token Number?
    // User spec: "Patient Token Page — /token/[id] ... Shows: Token number, Wave label..."
    // Usually ID implies Database ID in REST, but users might prefer Token Number if it's unique per session.
    // But Token Number resets every session. UUID is safer for URL.
    // I will assume [id] is the UUID. 
    // If user meant Token Number, we'd need session context or find the latest patient with that token.
    // Let's assume UUID for robustness.

    const patient = await prisma.patient.findUnique({
        where: { id: token },
        include: {
            wave: true,
            session: true,
        }
    });

    if (!patient) {
        // Try finding by token number in *today's* session as a fallback?
        // For now, 404.
        return notFound();
    }

    const wave = patient.wave;
    const session = patient.session;

    // Determine status message
    let statusMessage = "Please wait for your wave.";
    let statusColor = "bg-gray-100 text-gray-800";

    if (wave?.status === 'ACTIVE') {
        if (patient.status === 'CALLED') {
            statusMessage = "Please proceed to the doctor!";
            statusColor = "bg-green-100 text-green-800 animate-pulse";
        } else if (patient.status === 'WAITING') {
            statusMessage = "Your wave is active. Please be ready.";
            statusColor = "bg-blue-100 text-blue-800";
        }
    } else if (wave?.status === 'COMPLETED') {
        statusMessage = "Your wave has passed. Please contact reception.";
        statusColor = "bg-red-100 text-red-800";
    } else if (wave?.status === 'PENDING') {
        statusMessage = `Your wave starts at ${wave.startTime ? new Date(wave.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'soon'}.`;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Malabar Hospital OPD</CardTitle>
                    <div className="mt-4">
                        <h1 className="text-6xl font-black text-primary">#{patient.tokenNumber}</h1>
                        <p className="text-lg text-muted-foreground mt-2">{patient.name}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className={`p-4 rounded-lg font-medium text-lg ${statusColor}`}>
                        {statusMessage}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white p-3 rounded border">
                            <p className="text-xs text-muted-foreground">Wave</p>
                            <p className="text-xl font-bold">{wave?.waveLabel || '--'}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <p className="text-xs text-muted-foreground">Time</p>
                            {wave?.startTime ? (
                                <p className="text-xl font-bold">{new Date(wave.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            ) : (
                                <p className="text-xl font-bold">--:--</p>
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-center text-muted-foreground">
                        Auto-updates every few seconds (Pull to refresh)
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
