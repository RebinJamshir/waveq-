import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendWaveNotification = async (to: string, token: string, waveTime: string) => {
    try {
        const message = await client.messages.create({
            body: `WaveQ: You have been registered. Your Token is #${token}. Your Wave (${waveTime}) is coming up. Check status: ${process.env.NEXTAUTH_URL}/token/${token}`,
            from: phoneNumber,
            to: to,
        });
        return message;
    } catch (error) {
        console.error('Twilio Error:', error);
        return null;
    }
};
