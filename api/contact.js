// Vercel serverless function — Contact form → Email via Resend
// Sends to your email with subject: "Portfolio Contact : [Subject]"

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL       = process.env.CONTACT_EMAIL || 'shayan.dsouza@mail.utoronto.ca';

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ ok: false, error: 'Email service not configured' });
  }

  try {
    const { name, email, topic, message } = req.body;

    // Validation
    if (!name?.trim())  return res.status(400).json({ ok: false, error: 'Name is required' });
    if (!email?.trim() || !/.+@.+\..+/.test(email)) return res.status(400).json({ ok: false, error: 'Valid email is required' });
    if (!message?.trim()) return res.status(400).json({ ok: false, error: 'Message is required' });

    const subject = `Portfolio Contact : ${(topic || 'No subject').trim()}`;

    // Build email body (plain text + HTML)
    const textBody = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Subject: ${(topic || 'N/A').trim()}`,
      ``,
      `Message:`,
      message.trim(),
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 24px; color: #c8c0b4;">
          <h2 style="margin: 0 0 20px; color: #e8e0d4; font-size: 18px; border-bottom: 1px solid #222; padding-bottom: 12px;">
            🔥 New Beacon Signal
          </h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600; white-space: nowrap; vertical-align: top;">From</td>
              <td style="padding: 8px 12px; color: #c8c0b4;">${escapeHtml(name.trim())}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600; white-space: nowrap; vertical-align: top;">Email</td>
              <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(email.trim())}" style="color: #8a1520;">${escapeHtml(email.trim())}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600; white-space: nowrap; vertical-align: top;">Subject</td>
              <td style="padding: 8px 12px; color: #c8c0b4;">${escapeHtml((topic || 'N/A').trim())}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #111; border: 1px solid #1a1a1a; border-radius: 4px;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8a7a5a; margin-bottom: 8px;">Message</div>
            <div style="color: #c8c0b4; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message.trim())}</div>
          </div>
          <div style="margin-top: 20px; font-size: 11px; color: #3a3630; text-align: center;">
            Sent from your portfolio contact form
          </div>
        </div>
      </div>
    `;

    // Send via Resend API
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Shayan Dsouza <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email.trim(),
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    const result = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', result);
      return res.status(500).json({ ok: false, error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
