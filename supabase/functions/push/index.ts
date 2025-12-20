import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PushPayload = {
  title: string;
  body: string;
  data?: { type?: string; appointmentId?: string; [k: string]: unknown };
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PUSH_SECRET = Deno.env.get("PUSH_SECRET");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[push] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Dubai",
  }).format(date);
}

serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, x-push-secret",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }

    if (req.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    // Secret auth
    const secret = req.headers.get("x-push-secret");
    if (!PUSH_SECRET || secret !== PUSH_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
    }

    const payload = await req.json();
    console.log("[push] incoming payload", payload);

    let enrichedPayload: PushPayload | null = null;

    // INSERT case (appointments)
    if (payload?.type === "INSERT" && payload?.table === "appointments" && payload?.record) {
      const appointment = payload.record;

      const { data: client } = await supabase
        .from("clients")
        .select("first_name, last_name")
        .eq("id", appointment.client_id)
        .single();

      const { data: location } = await supabase
        .from("locations")
        .select("name")
        .eq("id", appointment.location_id)
        .single();

      const { data: service } = await supabase
        .from("appointment_service_pricing")
        .select("service_name, staff_name")
        .eq("appointment_id", appointment.id)
        .limit(1)
        .maybeSingle();

      const timeText = formatTime(appointment.created_at);

      const bodyText =
        `${timeText} ${service?.service_name ?? ""} for ` +
        `${client?.first_name ?? ""} ${client?.last_name ?? ""} with ` +
        `${service?.staff_name ?? ""} booked by ${location?.name ?? ""} reception`;

      if (appointment.isOnline === true) {
        bodyText += " (booked online)";
      }
      enrichedPayload = {
        title: "New appointment",
        body: bodyText,
        data: { type: appointment.status, appointmentId: appointment.id },
      };
    }

    // DELETE case (appointments)
    else if (payload?.type === "DELETE" && payload?.table === "appointments" && payload?.old_record) {
      const appointment = payload.old_record;

      const { data: client } = await supabase
        .from("clients")
        .select("first_name, last_name")
        .eq("id", appointment.client_id)
        .single();

      const { data: location } = await supabase
        .from("locations")
        .select("name")
        .eq("id", appointment.location_id)
        .single();

      const timeText = formatTime(payload.commit_timestamp ?? new Date().toISOString());

      const bodyText =
        `Appointment canceled at ${timeText} for ` +
        `${client?.first_name ?? ""} ${client?.last_name ?? ""} ` +
        `by ${location?.name ?? ""} reception`;

      enrichedPayload = {
        title: "Appointment canceled",
        body: bodyText,
        data: { type: "canceled", appointmentId: appointment.id },
      };
    }

    // SALES INSERT case (discounts/tips/vouchers/memberships)
    else if (payload?.type === "INSERT" && payload?.table === "sales" && payload?.record) {
      const sale = payload.record;

      const hasDiscountOrTip =
        (sale.voucher_discount ?? 0) > 0 ||
        (sale.membership_discount ?? 0) > 0 ||
        (sale.tip_amount ?? 0) > 0 ||
        (sale.discount_amount ?? 0) > 0 ||
        (sale.manual_discount ?? 0) > 0;

      if (hasDiscountOrTip) {
        const { data: client } = await supabase
          .from("clients")
          .select("first_name, last_name")
          .eq("id", sale.client_id)
          .single();

        const { data: appointment } = await supabase
          .from("appointments")
          .select("location_id, created_at")
          .eq("id", sale.appointment_id)
          .single();

        const { data: location } = await supabase
          .from("locations")
          .select("name")
          .eq("id", appointment?.location_id)
          .single();

        const { data: service } = await supabase
          .from("appointment_service_pricing")
          .select("service_name, staff_name")
          .eq("appointment_id", sale.appointment_id)
          .limit(1)
          .maybeSingle();

        const timeText = formatTime(sale.created_at);

        // Collect all applied items
        const parts: string[] = [];
        if ((sale.voucher_discount ?? 0) > 0) parts.push(`Voucher AED ${sale.voucher_discount}`);
        if ((sale.membership_discount ?? 0) > 0) parts.push(`Membership AED ${sale.membership_discount}`);
        if ((sale.discount_amount ?? 0) > 0) parts.push(`Discount AED ${sale.discount_amount}`);
        if ((sale.manual_discount ?? 0) > 0) parts.push(`Manual discount AED ${sale.manual_discount}`);
        if ((sale.tip_amount ?? 0) > 0) parts.push(`Tip AED ${sale.tip_amount}`);

        // Dynamic title/type
        let title: string;
        let type: string;
        if (parts.length > 1) {
          title = "Discounts & tips applied";
          type = "combined";
        } else {
          const single = parts[0] ?? "Sale update";
          if (single.includes("Voucher")) { title = "Voucher applied"; type = "voucher"; }
          else if (single.includes("Membership")) { title = "Membership discount"; type = "membership"; }
          else if (single.includes("Manual")) { title = "Manual discount"; type = "manual_discount"; }
          else if (single.includes("Tip")) { title = "Tip added"; type = "tip"; }
          else { title = "Discount applied"; type = "discount"; }
        }

        const preposition = type === "tip" ? "from" : "for";

        const bodyText =
          `${parts.join(" + ")} added at ${timeText} ${preposition} ` +
          `${client?.first_name ?? ""} ${client?.last_name ?? ""} ` +
          `${service?.service_name ? "(" + service.service_name + ")" : ""} ` +
          `with ${service?.staff_name ?? ""} by ${location?.name ?? ""} reception`;
        enrichedPayload = {
          title,
          body: bodyText,
          data: { type, appointmentId: sale.appointment_id },
        };
      }
    }
    // PRODUCTS INSERT/UPDATE case (low stock alert)
    else if ((payload?.type === "INSERT" || payload?.type === "UPDATE") 
            && payload?.table === "products" 
            && payload?.record) {
      const product = payload.record;

      const LOW_STOCK = 1;

      if (Number(product.total_stock ?? 0) <= LOW_STOCK) {

        const bodyText =
          `⚠️ Product "${product.product_name}" is low in stock ` +
          `(only ${product.total_stock} left)`;

        enrichedPayload = {
          title: "Product Low stock",
          body: bodyText,
          data: { type: "low_stock", productId: product.id },
        };
      }
    }

    // Direct push payload case
    else if (payload?.title && payload?.body) {
      enrichedPayload = payload as PushPayload;
    } else {
      return jsonResponse({ ok: false, error: "Invalid payload" }, 400);
    }

    // Fetch tokens
    const { data: tokens, error: tokenErr } = await supabase
      .from("device_push_tokens")
      .select("expo_push_token");

    if (tokenErr) {
      console.error("[push] token fetch error", tokenErr);
      return jsonResponse({ ok: false, error: "Failed to read tokens" }, 500);
    }

    const validTokens: string[] = (tokens ?? [])
      .map((t: any) => t?.expo_push_token as string)
      .filter((t) => typeof t === "string" && t.startsWith("ExponentPushToken["));

    if (validTokens.length) {
      const messages = validTokens.map((to) => ({
        to,
        sound: "default" as const,
        title: enrichedPayload!.title,
        body: enrichedPayload!.body,
        data: enrichedPayload!.data ?? {},
      }));

      const resp = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(messages),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("[push] Expo API error", resp.status, text);
      } else {
        console.log("[push] Expo push sent");
      }
    } else {
      console.log("[push] No valid tokens found");
    }

    // Persist notification
    const { error: insertErr } = await supabase.from("notifications").insert({
      title: enrichedPayload!.title,
      body: enrichedPayload!.body,
      type: enrichedPayload!.data?.type,
      appointment_id: enrichedPayload!.data?.appointmentId as any,
    });

    if (insertErr) {
      console.error("[push] insert notification error", insertErr);
      return jsonResponse({ ok: false, error: insertErr.message }, 500);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (e) {
    console.error("[push] unhandled error", e);
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});
