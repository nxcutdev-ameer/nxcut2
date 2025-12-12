import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PushPayload = {
  title: string;
  body: string;
  data?: { type?: string; appointmentId?: string; [k: string]: unknown };
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PUSH_SECRET = Deno.env.get('PUSH_SECRET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[push] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function sendExpoPushBatch(messages: any[]) {
  const resp = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(messages),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('[push] Expo API error', resp.status, text);
    return null;
  }
  const json = await resp.json();
  return json as { data?: any[]; errors?: any[] };
}

serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, x-push-secret',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      });
    }

    if (req.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
    }

    // Secret auth
    const secret = req.headers.get('x-push-secret');
    if (!PUSH_SECRET || secret !== PUSH_SECRET) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
    }

    const payload = (await req.json()) as PushPayload;
    if (!payload?.title || !payload?.body) {
      return jsonResponse({ ok: false, error: 'Invalid payload: title/body required' }, 400);
    }

    // 1) Fetch tokens
    const { data: tokens, error: tokenErr } = await supabase
      .from('device_push_tokens')
      .select('expo_push_token');

    if (tokenErr) {
      console.error('[push] token fetch error', tokenErr);
      return jsonResponse({ ok: false, error: 'Failed to read tokens' }, 500);
    }

    const validTokens: string[] = (tokens ?? [])
      .map((t: any) => t?.expo_push_token as string)
      .filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken['));

    if (validTokens.length) {
      const messages = validTokens.map((to) => ({
        to,
        sound: 'default' as const,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
      }));

      const batches = chunk(messages, 100);
      for (const batch of batches) {
        try {
          const res = await sendExpoPushBatch(batch);
          // Optional: inspect res?.data for ticket errors and prune invalid tokens later
        } catch (e) {
          console.error('[push] batch send error', e);
        }
      }
    } else {
      console.log('[push] No valid tokens found');
    }

    // 3) Persist notification for in-app list
    const { error: insertErr } = await supabase.from('notifications').insert({
      title: payload.title,
      body: payload.body,
      type: payload.data?.type,
      appointment_id: payload.data?.appointmentId as any,
    });
    if (insertErr) {
      console.error('[push] insert notification error', insertErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    console.error('[push] unhandled error', e);
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});
