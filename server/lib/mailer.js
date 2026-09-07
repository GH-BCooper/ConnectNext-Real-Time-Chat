// Email delivery via Resend (https://resend.com) — HTTP API, no SMTP.
//
//   RESEND_API_KEY=re_xxxxxxxx        # https://resend.com/api-keys
//   MAIL_FROM="ConnectNext <no-reply@yourdomain.com>"
//
// The "from" address must be on a domain you've verified in Resend. Until you
// verify one, Resend only lets you send from "onboarding@resend.dev" and only
// to the email address that owns the Resend account — that's the default below.
//
// When RESEND_API_KEY is missing, email is not sent and the message is logged
// to the server console instead (local dev fallback).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM || "ConnectNext <onboarding@resend.dev>";

export const isMailConfigured = () => Boolean(RESEND_API_KEY);

// Send a raw email. Falls back to a console log when Resend isn't configured.
export async function sendMail({ to, subject, text, html }) {
  if (!isMailConfigured()) {
    console.log(
      `\n[mailer] RESEND_API_KEY not set — would have emailed ${to}\n` +
        `Subject: ${subject}\n${text}\n`,
    );
    return { delivered: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, text, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }

  return { delivered: true };
}

// Password reset email.
export function sendPasswordResetEmail(to, resetLink) {
  const subject = "Reset your ConnectNext password";
  const text =
    `Someone (hopefully you) asked to reset the password for this account.\n\n` +
    `Open this link to choose a new password:\n${resetLink}\n\n` +
    `This link expires in 1 hour. If you didn't request it, you can ignore this email.`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1f2937">
      <h2 style="margin:0 0 12px">Reset your password</h2>
      <p style="margin:0 0 16px;line-height:1.5">
        Someone (hopefully you) asked to reset the password for this account.
        Click below to choose a new one.
      </p>
      <p style="margin:0 0 20px">
        <a href="${resetLink}"
           style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">
          Choose a new password
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280">
        Or paste this link into your browser:
      </p>
      <p style="margin:0 0 16px;font-size:13px;word-break:break-all">
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280">
        This link expires in 1 hour. If you didn't request it, you can ignore this email.
      </p>
    </div>`;

  return sendMail({ to, subject, text, html });
}
