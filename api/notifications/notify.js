// api/notifications/notify.js
import Brevo from '@getbrevo/brevo';
import { createHash } from 'crypto';

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
    const notificationId = payload?.notification_id || null;
    const notificationType = (payload?.notification_type || '').toLowerCase().replace(/\s+/g, '_');

    // Simple template registry; payload values override templates if provided
    const templates = {
      new_friend: {
        subject: 'You have a new friend on StyleSnap',
        html: `
          <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2 style="margin:0 0 12px;">New friend added 🎉</h2>
            <p style="margin:0 0 12px;">${payload?.actor_name || 'Someone'} just became your friend.</p>
            <p style="margin:0 0 12px;">Open the app to say hello and view their closet.</p>
          </div>
        `
      },
      friend_request: {
        subject: 'You received a friend request',
        html: `
          <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2 style="margin:0 0 12px;">New friend request</h2>
            <p style="margin:0 0 12px;">${payload?.actor_name || 'A user'} sent you a friend request.</p>
            <p style="margin:0 0 12px;">Open the app to accept or decline.</p>
          </div>
        `
      },
      comment: {
        subject: 'New comment on your outfit',
        html: `
          <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2 style="margin:0 0 12px;">New comment 💬</h2>
            <p style="margin:0 0 12px;">${payload?.actor_name || 'A friend'} commented: “${payload?.comment_preview || 'View in app'}”.</p>
            <p style="margin:0 0 12px;">Open the app to reply.</p>
          </div>
        `
      },
      like: {
        subject: 'Someone liked your outfit',
        html: `
          <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2 style="margin:0 0 12px;">Your outfit got a like ❤️</h2>
            <p style="margin:0 0 12px;">${payload?.actor_name || 'A friend'} liked your outfit.</p>
          </div>
        `
      }
    };

    const templ = templates[notificationType] || null;
    const subject = payload?.subject || templ?.subject;
    const htmlContent = payload?.content_html || templ?.html;

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

    // Lightweight idempotency metadata (does not prevent duplicates without storage,
    // but helps tracing/diagnostics in Brevo and logs)
    const dedupeBasis = `${recipientEmail}|${notificationType}|${subject}|${String(htmlContent).slice(0, 256)}`;
    const dedupeHash = createHash('sha256').update(dedupeBasis).digest('hex');
    email.headers = {
      ...(email.headers || {}),
      'X-Notification-ID': notificationId || '',
      'X-Idempotency-Key': dedupeHash,
      'X-Notification-Type': notificationType || ''
    };

    await transactionalEmailsApi.sendTransacEmail(email);

    return res.status(200).json({ success: true });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Email dispatch failed', detail: message });
  }
}


