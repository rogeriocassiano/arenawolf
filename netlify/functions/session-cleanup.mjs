export async function handler() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { statusCode: 500, body: "Session cleanup is not configured" };
  try {
    const response = await fetch(`${url}/rest/v1/rpc/settle_disconnected_sessions`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(20000),
    });
    return { statusCode: response.ok ? 200 : 502, body: response.ok ? "Session cleanup completed" : "Session cleanup failed" };
  } catch {
    return { statusCode: 502, body: "Session cleanup unavailable" };
  }
}
