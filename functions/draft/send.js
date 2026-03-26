// POST /draft/send
export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.KV;
  const body = await request.json();

  const TG_BOT_TOKEN = env.TG_BOT_TOKEN;
  const TG_CHAT_ID = env.TG_CHAT_ID;

  const tgUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendPhoto`;

  await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      photo: body.image_url,
      caption: body.caption,
      parse_mode: "HTML",
    }),
  });

  // Delete draft after sending
  let draftIndex = await KV.get("draft_index", { type: "json" });
  if (!draftIndex) draftIndex = [];
  draftIndex = draftIndex.filter((id) => id !== body.id);
  await KV.put("draft_index", JSON.stringify(draftIndex));
  await KV.delete(`draft:${body.id}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
