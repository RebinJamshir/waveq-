"use client"

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils'; // Make sure utils is imported for class merging

export default function DisplayBoard({ initialSession }: { initialSession: any }) {
    const [session, setSession] = useState(initialSession);
    const router = useRouter();

    useEffect(() => {
        const channel = pusherClient.subscribe('queue-updates');

        // Bind to all relevant events
        channel.bind('patient-added', () => router.refresh());
        channel.bind('wave-updated', () => router.refresh());
        channel.bind('status-updated', () => router.refresh());

        return () => {
            pusherClient.unsubscribe('queue-updates');
        };
    }, [router]);

    useEffect(() => {
        setSession(initialSession);
    }, [initialSession]);

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-4xl font-bold">Waiting for Session Start...</h1>
            </div>
        );
    }

    const activeWave = session.waves.find((w: any) => w.status === 'ACTIVE');
    const nextWave = session.waves.find((w: any) => w.status === 'PENDING');

    return (
        <div className="flex flex-col h-full gap-8">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h1 className="text-4xl font-bold tracking-tight">Malabar Hospital OPD</h1>
                <div className="text-2xl font-mono text-gray-400">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

                {/* Active Wave Column (Center Stage) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-blue-900 border border-blue-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        {/* Pulse Animation Background */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

                        <h2 className="text-3xl font-uppercase tracking-widest text-blue-200 mb-2">NOW SERVING</h2>
                        <div className="flex items-baseline space-x-4">
                            <span className="text-9xl font-black text-white">
                                Wave {activeWave?.waveLabel || '--'}
                            </span>
                            {activeWave && (
                                <span className="text-3xl text-blue-200">
                                    {new Date(activeWave.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    -
                                    {new Date(activeWave.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            {activeWave?.patients.length > 0 ? (
                                <div className="grid gap-4">
                                    {activeWave.patients.map((patient: any) => (
                                        <div key={patient.id} className={cn(
                                            "flex justify-between items-center p-6 rounded-xl border-l-8 transition-all duration-500",
                                            patient.status === 'CALLED' ? "bg-amber-500/20 border-amber-500" :
                                                patient.status === 'IN_CONSULTATION' ? "bg-green-500/20 border-green-500" :
                                                    "bg-gray-800 border-gray-600"
                                        )}>
                                            <div className="flex items-center space-x-6">
                                                <span className="text-5xl font-bold font-mono">#{patient.tokenNumber}</span>
                                                <span className="text-4xl font-semibold">{patient.name}</span>
                                            </div>
                                            <div className="text-2xl font-medium px-4 py-1 rounded bg-black/30">
                                                {patient.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-2xl text-gray-400 italic">No patients currently in this wave.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Wave Column */}
                <div className="lg:col-span-1 border-l border-gray-800 pl-8 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">UP NEXT</h2>

                    {nextWave ? (
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 opacity-75">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-5xl font-bold text-gray-200">Wave {nextWave.waveLabel}</span>
                                <span className="text-xl text-gray-400">
                                    {new Date(nextWave.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {nextWave.patients.map((patient: any) => (
                                    <div key={patient.id} className="flex justify-between items-center text-xl text-gray-300 border-b border-gray-800 pb-2 last:border-0">
                                        <span>{patient.name}</span>
                                        <span className="font-mono text-gray-500">#{patient.tokenNumber}</span>
                                    </div>
                                ))}
                                {nextWave.patients.length === 0 && <p className="text-gray-500">Filling up...</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-xl">No upcoming waves scheduled.</div>
                    )}

                    <div className="mt-12 p-6 bg-gray-900 rounded-xl">
                        <h3 className="text-lg font-medium text-gray-400 mb-2">Hospital Announcements</h3>
                        <p className="text-lg">Please keep your token number ready. Silent mobile phones.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
