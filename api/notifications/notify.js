// api/notifications/notify.js
import Brevo from '@getbrevo/brevo';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = req.body;
    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody || {};

    const recipientEmail = payload?.recipient_email;
    const subject = payload?.subject;
    const htmlContent = payload?.content_html;

    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({
        error: 'Invalid payload',
        detail: 'Required fields: recipient_email, subject, content_html'
      });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server misconfiguration',
        detail: 'BREVO_API_KEY is not set'
      });
    }

    const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
    transactionalEmailsApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const email = new Brevo.SendSmtpEmail();
    email.to = [{ email: recipientEmail }];
    email.sender = { email: 'no-reply@yourcompanydomain.com' };
    email.subject = subject;
    email.htmlContent = htmlContent;

    await transactionalEmailsApi.sendTransacEmail(email);

    return res.status(200).json({ success: true });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Email dispatch failed', detail: message });
  }
}


