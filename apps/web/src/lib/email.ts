/** Minimal Resend email sender (no SDK dependency). */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY/EMAIL_FROM not set; skipping email:",
      opts.subject,
    );
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    console.error("[email] Resend error:", res.status, await res.text());
  }
}

export function magicLinkEmail(url: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">Sign in to BehindTheCode</h2>
      <p style="color:#555;margin:0 0 20px">Click the button below to sign in. This link expires shortly.</p>
      <a href="${url}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Sign in</a>
      <p style="color:#999;font-size:13px;margin-top:20px">If you didn't request this, you can ignore this email.</p>
    </div>`;
}
