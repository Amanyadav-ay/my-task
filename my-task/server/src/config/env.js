import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'mytask_super_secret_access_key_2026_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'mytask_super_secret_refresh_key_2026_prod',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS, 10) || 7,
  },
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BF7kFp9L7W1C4Z_placeholder_vapid_key_client_use',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'placeholder_private_vapid_key_not_for_prod',
    subject: process.env.VAPID_SUBJECT || 'mailto:support@mytask.local',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'My Task <notifications@mytask.local>',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'heuristic', // 'gemini', 'openai', or 'heuristic'
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  },
};
