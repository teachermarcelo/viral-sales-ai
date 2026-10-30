import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  try {
    const { code } = await req.json();
    if (typeof code !== "string" || !/^vsa-[a-f0-9-]{8,36}$/i.test(code)) return new Response(JSON.stringify({ error: "Invalid tracking code" }), { status: 400, headers: cors });
    const projectUrl = Deno.env.get("SUPABASE_URL");
    const keyName = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
    const serverKey = Deno.env.get(keyName);
    if (!projectUrl || !serverKey) throw new Error("Server configuration missing");
    const admin = createClient(projectUrl, serverKey, { auth: { persistSession: false } });
    const { data: link, error } = await admin.from("vsa_tracking_links").select("id,user_id,destination_url").eq("code", code).maybeSingle();
    if (error) throw error;
    if (!link) return new Response(JSON.stringify({ error: "Link not found" }), { status: 404, headers: cors });
    let host = null;
    try { const ref = req.headers.get("referer"); host = ref ? new URL(ref).hostname : null; } catch { /* ignore */ }
    const result = await admin.from("vsa_tracking_events").insert({ user_id: link.user_id, tracking_link_id: link.id, event_type: "click", referrer_host: host });
    if (result.error) throw result.error;
    return new Response(JSON.stringify({ destination_url: link.destination_url }), { status: 200, headers: cors });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Could not record click" }), { status: 500, headers: cors });
  }
});