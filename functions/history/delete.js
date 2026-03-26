// POST /history/delete
export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.KV;
  const body = await request.json();

  let historyIndex = await KV.get("history_index", { type: "json" });
  if (!historyIndex) historyIndex = [];
  historyIndex = historyIndex.filter((id) => id !== body.id);
  await KV.put("history_index", JSON.stringify(historyIndex));
  await KV.delete(`history:${body.id}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
