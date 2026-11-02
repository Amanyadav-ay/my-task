import webpush from 'web-push';
import { config } from './env.js';

if (config.vapid.publicKey && config.vapid.privateKey && !config.vapid.publicKey.includes('placeholder')) {
  try {
    webpush.setVapidDetails(
      config.vapid.subject,
      config.vapid.publicKey,
      config.vapid.privateKey
    );
  } catch (err) {
    console.warn('⚠️ Web Push VAPID configuration error:', err.message);
  }
}

export default webpush;
