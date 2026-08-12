import { getStore } from "@netlify/blobs";

const STORE_NAME = "roi-dashboard";
const KEY = "shared-state";

export default async (req) => {
  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return new Response(JSON.stringify(data || null), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!body || !Array.isArray(body.properties) || body.properties.length === 0) {
      return new Response(JSON.stringify({ error: "Missing properties array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const payload = { properties: body.properties, activeId: body.activeId || null, updatedAt: Date.now() };
    await store.setJSON(KEY, payload);
    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/state",
};
