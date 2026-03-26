// GET /history/list
export async function onRequestGet(context) {
  const KV = context.env.KV;

  let historyIndex = await KV.get("history_index", { type: "json" });
  if (!historyIndex) historyIndex = [];

  // Last 50 items (newest first)
  const recentIds = historyIndex.slice(-50).reverse();

  const items = [];
  for (const id of recentIds) {
    const item = await KV.get(`history:${id}`, { type: "json" });
    if (item) items.push(item);
  }

  return new Response(JSON.stringify({ items }), {
    headers: { "Content-Type": "application/json" },
  });
}
