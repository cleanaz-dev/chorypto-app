// lib/resend.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to, inviteToken) {
  try {
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${inviteToken}`;
    
    const data = await resend.emails.send({
      from: process.env.RESEND_SENDER_EMAIL, // Update with your domain
      to,
      subject: 'Invitation to Join Organization',
      html: `
        <h2>You've been invited!</h2>
        <p>Click the link below to accept your invitation and join the organization:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Accept Invitation
        </a>
        <p>This invitation will expire in 7 days.</p>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}