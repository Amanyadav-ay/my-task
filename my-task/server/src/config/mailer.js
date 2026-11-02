import nodemailer from 'nodemailer';
import { config } from './env.js';

let transporter = null;

if (config.email.host && config.email.user) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

export const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      return await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('❌ Failed to send real email:', error.message);
    }
  }

  // Graceful fallback for development / local testing:
  console.log('----------------------------------------------------');
  console.log(`📧 [MOCK EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text || html}`);
  console.log('----------------------------------------------------');
  return { messageId: 'mock-mail-' + Date.now() };
};

export default { sendEmail };
