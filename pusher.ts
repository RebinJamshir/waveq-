import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const isMock = process.env.PUSHER_APP_ID === 'mock_id' || !process.env.PUSHER_APP_ID;

// Mock Server implementation
const mockPusherServer = {
    trigger: async (channel: string, event: string, data: any) => {
        console.log(`[Pusher Mock] Triggered '${event}' on '${channel}'`, data);
        return Promise.resolve();
    }
} as unknown as PusherServer;

// Real Server implementation
const realPusherServer = typeof window === 'undefined' ? new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
}) : null;

export const pusherServer = isMock ? mockPusherServer : realPusherServer!;

// Mock Client
const mockPusherClient = {
    subscribe: (channel: string) => ({
        bind: (event: string, callback: Function) => console.log(`[Pusher Mock] Bound to '${event}' on '${channel}'`),
        unbind: () => { },
    }),
    unsubscribe: () => { },
} as unknown as PusherClient;

export const pusherClient = isMock ? mockPusherClient : new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});
