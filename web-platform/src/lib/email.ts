/**
 * Email sender — thin wrapper around Resend REST API.
 *
 * If `RESEND_API_KEY` env var is missing, we log the message to the server
 * console instead of sending. This lets the rest of the app run in
 * development / demo setups without paid email. Set `EMAIL_FROM` to control
 * the sender address (defaults to `Signal Trade GPT <no-reply@localhost>`).
 */

export type SendEmail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendResult =
  | { ok: true; id: string | null; stub?: boolean }
  | { ok: false; error: string };

const RESEND_URL = "https://api.resend.com/emails";

export async function sendEmail(msg: SendEmail): Promise<SendResult> {
  const key = process.env["RESEND_API_KEY"];
  const from =
    process.env["EMAIL_FROM"] ?? "Signal Trade GPT <no-reply@localhost>";

  if (!key) {
    console.warn(
      "[email] RESEND_API_KEY not set — stubbing email",
      JSON.stringify({ to: msg.to, subject: msg.subject }),
    );
    console.warn("[email] Body preview:\n" + (msg.text ?? msg.html));
    return { ok: true, id: null, stub: true };
  }

  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      return { ok: false, error: `Resend ${r.status}: ${body.slice(0, 200)}` };
    }
    const data = (await r.json()) as { id?: string };
    return { ok: true, id: data.id ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function renderOtpEmail(code: string, purpose: string): {
  subject: string;
  html: string;
  text: string;
} {
  const purposes: Record<string, string> = {
    email_verify: "Подтверждение email",
    email_change: "Смена email",
    password_reset: "Сброс пароля",
    login_2fa: "Код входа",
  };
  const title = purposes[purpose] ?? "Код подтверждения";
  const text =
    `${title}\n\nТвой код: ${code}\n\n` +
    `Код действителен 10 минут. Если не запрашивал — просто проигнорируй письмо.\n\n` +
    `Signal Trade GPT`;
  const html = `
<!doctype html>
<html lang="ru"><body style="font-family:system-ui,Segoe UI,sans-serif;background:#0a0a13;color:#eee;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#0d0d18;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:18px;font-weight:600">${title}</h1>
    <p style="color:#aaa;font-size:14px;line-height:1.5;margin:0 0 24px">Твой код подтверждения:</p>
    <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:28px;letter-spacing:8px;font-weight:700;color:#f5c518;padding:16px 20px;background:#0a0a13;border:1px solid rgba(255,255,255,.08);border-radius:10px;text-align:center">${code}</div>
    <p style="color:#666;font-size:12px;line-height:1.5;margin:24px 0 0">Код действителен 10 минут. Если ты не запрашивал код — просто проигнорируй письмо.</p>
    <p style="color:#666;font-size:11px;margin-top:24px">Signal Trade GPT</p>
  </div>
</body></html>`.trim();
  return { subject: `${title} — ${code}`, html, text };
}

export function renderNotifEmail(
  title: string,
  body: string,
  ctaUrl?: string,
  ctaLabel?: string,
): { subject: string; html: string; text: string } {
  const cta =
    ctaUrl && ctaLabel
      ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f5c518;color:#1a1208;text-decoration:none;border-radius:8px;font-weight:600">${ctaLabel}</a>`
      : "";
  const text = `${title}\n\n${body}${ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ""}`;
  const html = `
<!doctype html>
<html lang="ru"><body style="font-family:system-ui,Segoe UI,sans-serif;background:#0a0a13;color:#eee;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#0d0d18;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px">
    <h1 style="margin:0 0 12px;font-size:18px;font-weight:600">${title}</h1>
    <div style="color:#aaa;font-size:14px;line-height:1.6">${body.replace(/\n/g, "<br>")}</div>
    ${cta}
    <p style="color:#666;font-size:11px;margin-top:32px">Signal Trade GPT</p>
  </div>
</body></html>`.trim();
  return { subject: title, html, text };
}
