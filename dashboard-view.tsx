"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { pusherClient } from '@/lib/pusher';
import { useRouter } from 'next/navigation';

export default function DashboardView({ initialSession }: { initialSession: any }) {
    const [session, setSession] = useState(initialSession);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        // Subscribe to Pusher channel
        const channel = pusherClient.subscribe('queue-updates');

        channel.bind('patient-added', (data: any) => {
            // Refresh data by re-fetching or reloading
            // For simplicity in this demo, we'll reload the page data via router.refresh()
            // In a real app, we'd merge state locally or fetch new data.
            router.refresh();
            toast({
                title: "New Patient Added",
                description: `${data.patient.name} added to Wave ${data.wave.waveLabel}`,
            });
        });

        channel.bind('status-updated', (data: any) => {
            router.refresh();
        });

        return () => {
            pusherClient.unsubscribe('queue-updates');
        };
    }, [router, toast]);

    // Update local state when prop changes (from router.refresh)
    useEffect(() => {
        setSession(initialSession);
    }, [initialSession]);


    const handleStartSession = async () => {
        // API call to create session would go here
        // For now, let's just use the patient registration to auto-create if needed as per API logic
        toast({ title: "Start Session", description: "Use the register form to auto-start session or implement explicit start." });
    };

    const registerPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPatientName) return;
        setLoading(true);

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPatientName, phone: newPatientPhone }),
            });

            if (!res.ok) throw new Error('Failed to register');

            const data = await res.json();
            setNewPatientName('');
            setNewPatientPhone('');
            toast({
                title: "Success",
                description: `Registered ${data.patient.name} - Token #${data.patient.tokenNumber}`,
            });
            router.refresh();

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to register patient",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-xl font-semibold">No Active Session Today</h2>
                <p className="text-muted-foreground">Register a patient to automatically start a session.</p>
                <Card className="w-full max-w-md">
                    <CardHeader><CardTitle>Start New Session</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={registerPatient} className="space-y-4">
                            <Input
                                placeholder="Patient Name"
                                value={newPatientName}
                                onChange={(e) => setNewPatientName(e.target.value)}
                            />
                            <Input
                                placeholder="Phone (Optional)"
                                value={newPatientPhone}
                                onChange={(e) => setNewPatientPhone(e.target.value)}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Starting...' : 'Start Session & Register First Patient'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate stats
    const totalPatients = session.waves.reduce((acc: number, wave: any) => acc + wave.patients.length, 0);
    const waitingPatients = session.waves.reduce((acc: number, wave: any) => acc + wave.patients.filter((p: any) => p.status === 'WAITING').length, 0);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Stats */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPatients}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{waitingPatients}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Wave</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {session.waves.find((w: any) => w.status === 'ACTIVE')?.waveLabel || 'None'}
                    </div>
                </CardContent>
            </Card>

            {/* Register Form */}
            <Card className="md:col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Register Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={registerPatient} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Patient Name"
                                value={newPatientName}
                                onChange={(e) => setNewPatientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Phone Number"
                                value={newPatientPhone}
                                onChange={(e) => setNewPatientPhone(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Patient'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Waves List */}
            <div className="md:col-span-2 lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold">Active Waves</h2>
                {session.waves.map((wave: any) => (
                    <Card key={wave.id} className={`border-l-4 ${wave.status === 'ACTIVE' ? 'border-l-primary' : wave.status === 'COMPLETED' ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Wave {wave.waveLabel}</CardTitle>
                                <Badge variant={wave.status === 'ACTIVE' ? 'default' : 'secondary'}>{wave.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {wave.startTime ? new Date(wave.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'} -
                                {wave.endTime ? new Date(wave.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {wave.patients.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No patients in this wave yet.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-muted-foreground border-b">
                                                <th className="pb-2">Token</th>
                                                <th className="pb-2">Name</th>
                                                <th className="pb-2">Status</th>
                                                <th className="pb-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wave.patients.map((patient: any) => (
                                                <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="py-2 font-medium">#{patient.tokenNumber}</td>
                                                    <td className="py-2">{patient.name}</td>
                                                    <td className="py-2">
                                                        <Badge variant="outline" className={
                                                            patient.status === 'CALLED' ? 'bg-yellow-100 text-yellow-800' :
                                                                patient.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    patient.status === 'NO_SHOW' ? 'bg-red-100 text-red-800' : ''
                                                        }>{patient.status}</Badge>
                                                    </td>
                                                    <td className="py-2 text-right space-x-2">
                                                        {/* Actions go here */}
                                                        <Button size="sm" variant="ghost">Edit</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
