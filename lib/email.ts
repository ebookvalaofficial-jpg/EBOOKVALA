/**
 * Helper utility to send transactional auth emails.
 * Supports Resend API key when configured, with a clear console-logging fallback.
 */

export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; url: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email/${token}`;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.startsWith('re_123456789')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'EbookVala <onboarding@resend.dev>',
          to: [email],
          subject: 'Verify your EbookVala Account Email',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb;">Welcome to EbookVala!</h2>
              <p>Please confirm your email address to activate your account and start exploring eBooks and AI reading features.</p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Verify Email Address</a>
              <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser: <br/>${verificationUrl}</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        console.log(`[RESEND API SUCCESS] Verification email sent to ${email}`);
        return { success: true, url: verificationUrl };
      } else {
        const errorText = await response.text();
        console.error('[RESEND API ERROR] Resend returned error:', response.status, errorText);
      }
    } catch (err) {
      console.error('[EMAIL UTILITY ERROR] Failed to send email via Resend API:', err);
    }
  }

  // Fallback logger for local development / testing
  console.log('\n======================================================');
  console.log('✉️  [FALLBACK EMAIL SERVICE] Email Verification Token');
  console.log(`To: ${email}`);
  console.log(`Link: ${verificationUrl}`);
  console.log('======================================================\n');

  return { success: true, url: verificationUrl };
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; url: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.startsWith('re_123456789')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'EbookVala Security <onboarding@resend.dev>',
          to: [email],
          subject: 'Reset your EbookVala Password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb;">Password Reset Request</h2>
              <p>We received a request to reset your EbookVala account password.</p>
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
              <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser: <br/>${resetUrl}</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">If you did not request a password reset, please ignore this email. This link expires in 1 hour.</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        console.log(`[RESEND API SUCCESS] Password reset email sent to ${email}`);
        return { success: true, url: resetUrl };
      } else {
        const errorText = await response.text();
        console.error('[RESEND API ERROR] Resend returned error:', response.status, errorText);
      }
    } catch (err) {
      console.error('[EMAIL UTILITY ERROR] Failed to send email via Resend API:', err);
    }
  }

  // Fallback logger for local development / testing
  console.log('\n======================================================');
  console.log('🔑 [FALLBACK EMAIL SERVICE] Password Reset Token');
  console.log(`To: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log('======================================================\n');

  return { success: true, url: resetUrl };
}

export async function sendRawEmail(email: string, subject: string, htmlContent: string): Promise<{ success: boolean }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.startsWith('re_123456789')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'EbookVala <onboarding@resend.dev>',
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        console.log(`[RESEND API SUCCESS] Raw email sent to ${email}`);
        return { success: true };
      }
    } catch (err) {
      console.error('[EMAIL UTILITY ERROR] Failed to send email via Resend API:', err);
    }
  }

  console.log(`✉️ [FALLBACK RAW EMAIL] To: ${email} | Subject: ${subject}`);
  return { success: true };
}
