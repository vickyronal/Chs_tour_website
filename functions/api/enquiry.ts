/**
 * Cloudflare Pages Function. Receives planner enquiries and passes them to the
 * Google Apps Script webhook, which adds a Sheet row and emails CHS.
 * It reports success only once the webhook confirms. See docs/enquiry-setup.md.
 */
interface Env {
  LEADS_WEBHOOK_URL?: string;
  LEADS_WEBHOOK_SECRET?: string;
  TURNSTILE_SECRET?: string;
}

const reply = (ok: boolean, status: number, error?: string) =>
  new Response(JSON.stringify({ ok, error }), { status, headers: { 'content-type': 'application/json' } });

const text = (value: unknown, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return reply(false, 400, 'bad_request');
  }

  // Bots fill the hidden field; give them nothing to learn from
  if (text(data.website)) return reply(true, 200);

  const lead = {
    name: text(data.name, 100),
    whatsapp: text(data.whatsapp, 24),
    email: text(data.email, 120),
    where: text(data.where, 120),
    when: text(data.when, 40),
    who: text(data.who, 40),
    tour: text(data.tour, 120),
    note: text(data.note, 1000),
    page: text(data.page, 200),
    source: text(data.source, 200),
    consent: data.consent === true,
  };
  if (!lead.name || !/^[+\d][\d\s-]{6,20}$/.test(lead.whatsapp) || !lead.consent) {
    return reply(false, 422, 'invalid');
  }

  if (env.TURNSTILE_SECRET) {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: text(data.turnstile, 4096) }),
    });
    const result = (await check.json()) as { success?: boolean };
    if (!result.success) return reply(false, 403, 'spam_check');
  }

  if (!env.LEADS_WEBHOOK_URL) return reply(false, 503, 'not_configured');

  try {
    const res = await fetch(env.LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...lead, secret: env.LEADS_WEBHOOK_SECRET }),
    });
    const result = (await res.json()) as { ok?: boolean };
    return res.ok && result.ok ? reply(true, 200) : reply(false, 502, 'delivery_failed');
  } catch {
    return reply(false, 502, 'delivery_failed');
  }
}
