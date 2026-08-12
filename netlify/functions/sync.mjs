import { getStore } from "@netlify/blobs";

const STATE_STORE = "roi-dashboard";
const STATE_KEY = "shared-state";
const PRESENCE_STORE = "roi-dashboard-presence";
const PRESENCE_TTL_MS = 12000; // a session counts as "online" if it's heartbeated within this window

// Single endpoint that does everything in one request: optionally writes a properties edit,
// always heartbeats the caller's presence, and always returns the current shared state plus
// who else is online. Keeping this to one call per polling tick matters at a 3s interval —
// splitting state + presence into separate requests would double function invocation volume.
export default async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
  }

  const stateStore = getStore(STATE_STORE);
  const presenceStore = getStore(PRESENCE_STORE);
  const now = Date.now();

  let statePayload;
  if (Array.isArray(body.properties) && body.properties.length > 0) {
    statePayload = { properties: body.properties, activeId: body.activeId || null, updatedAt: now };
    await stateStore.setJSON(STATE_KEY, statePayload);
  } else {
    statePayload = await stateStore.get(STATE_KEY, { type: "json" });
  }

  if (body.sessionId) {
    await presenceStore.setJSON(body.sessionId, {
      label: body.label || "Anonymous",
      emoji: body.emoji || "🙂",
      color: body.color || "#6B675C",
      lastSeen: now,
    });
  }

  const onlineUsers = [];
  const { blobs } = await presenceStore.list();
  await Promise.all(
    blobs.map(async ({ key }) => {
      const entry = await presenceStore.get(key, { type: "json" });
      if (!entry) return;
      if (now - entry.lastSeen > PRESENCE_TTL_MS) {
        await presenceStore.delete(key);
        return;
      }
      onlineUsers.push({ id: key, label: entry.label, emoji: entry.emoji, color: entry.color });
    })
  );

  return new Response(
    JSON.stringify({
      properties: statePayload ? statePayload.properties : null,
      activeId: statePayload ? statePayload.activeId : null,
      updatedAt: statePayload ? statePayload.updatedAt : null,
      onlineUsers,
    }),
    { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
};

export const config = {
  path: "/api/sync",
};
