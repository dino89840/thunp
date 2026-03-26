// GET /draft/list
export async function onRequestGet(context) {
  const KV = context.env.KV;

  let draftIndex = await KV.get("draft_index", { type: "json" });
  if (!draftIndex) draftIndex = [];

  const items = [];
  for (const id of draftIndex) {
    const item = await KV.get(`draft:${id}`, { type: "json" });
    if (item) items.push(item);
  }

  // Sort by created_at (oldest first)
  items.sort((a, b) => a.created_at.localeCompare(b.created_at));

  return new Response(JSON.stringify({ items }), {
    headers: { "Content-Type": "application/json" },
  });
}
