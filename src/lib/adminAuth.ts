// Server-side guard for the /api/admin/* routes.
//
// The admin UI runs on the `robi-seo` Firebase project, but the stats it shows
// live in `robi-ai-system`. The bridge is a shared secret held only here, on
// the server — never shipped to the browser. Before using it we verify that the
// caller really is a signed-in allow-listed admin.
//
// Verification goes through Google's Identity Toolkit rather than firebase-admin
// so the site keeps zero extra dependencies: Google validates the token's
// signature and expiry, we only check the resulting email.

const ALLOWED_EMAILS = ["ralphkaram75014@gmail.com", "robi@robi-app.com"];

const FUNCTIONS_BASE =
  process.env.ROBI_FUNCTIONS_URL || "https://europe-west1-robi-ai-system.cloudfunctions.net";

export type AdminGuardResult =
  | { ok: true; email: string }
  | { ok: false; status: number; error: string };

export async function requireAdmin(req: Request): Promise<AdminGuardResult> {
  const header = req.headers.get("authorization") || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!idToken) return { ok: false, status: 401, error: "missing_token" };

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return { ok: false, status: 500, error: "firebase_not_configured" };

  let email: string | undefined;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return { ok: false, status: 401, error: "invalid_token" };
    const data = (await res.json()) as { users?: { email?: string }[] };
    email = data.users?.[0]?.email?.toLowerCase();
  } catch {
    return { ok: false, status: 502, error: "verification_failed" };
  }

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  return { ok: true, email };
}

/** Calls a secret-protected endpoint on the robi-ai-system project. */
export async function callRobiFunction(
  name: string,
  init?: { method?: string; body?: unknown; query?: string }
): Promise<{ status: number; json: unknown }> {
  const secret = process.env.ADMIN_STATS_SECRET;
  if (!secret) return { status: 500, json: { error: "ADMIN_STATS_SECRET manquant" } };

  const url = `${FUNCTIONS_BASE}/${name}${init?.query ? `?${init.query}` : ""}`;
  const res = await fetch(url, {
    method: init?.method || "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
