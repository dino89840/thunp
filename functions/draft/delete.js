// POST /draft/delete
export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.KV;
  const body = await request.json();

  // Index ကနေ ဖယ်ရှား
  let draftIndex = await KV.get("draft_index", { type: "json" });
  if (!draftIndex) draftIndex = [];
  draftIndex = draftIndex.filter((id) => id !== body.id);
  await KV.put("draft_index", JSON.stringify(draftIndex));
  await KV.delete(`draft:${body.id}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
