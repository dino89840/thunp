// POST /draft/save
export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.KV;
  const body = await request.json();

  const id = Date.now().toString();
  const draftItem = {
    id,
    image_url: body.url,
    caption: body.caption,
    created_at: new Date().toISOString(),
  };

  // Draft index ထဲထည့်
  let draftIndex = await KV.get("draft_index", { type: "json" });
  if (!draftIndex) draftIndex = [];
  draftIndex.push(id);
  await KV.put("draft_index", JSON.stringify(draftIndex));
  await KV.put(`draft:${id}`, JSON.stringify(draftItem));

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
