// POST /upload
const THUMBSNAP_KEY = "0004640d6fb420fbe95d270e65ab0ccb";

export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.KV;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upload to Thumbsnap
    const tsData = new FormData();
    tsData.append("key", THUMBSNAP_KEY);
    tsData.append("media", file);
    tsData.append("adult", "1");

    const tsRes = await fetch("https://thumbsnap.com/api/upload", {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: tsData,
    });

    if (!tsRes.ok) {
      throw new Error(`Upload Failed: Server returned ${tsRes.status}`);
    }

    const tsJson = await tsRes.json();

    if (!tsJson.success) {
      throw new Error(tsJson.error?.message || "Upload Failed");
    }

    const publicUrl = tsJson.data.media;

    // Save to History (Cloudflare KV)
    const id = Date.now().toString();
    const historyItem = {
      id,
      public_url: publicUrl,
      file_name: file.name,
      created_at: new Date().toISOString(),
    };

    // KV မှာ history index ကို array အဖြစ်သိမ်း
    let historyIndex = await KV.get("history_index", { type: "json" });
    if (!historyIndex) historyIndex = [];
    historyIndex.push(id);
    await KV.put("history_index", JSON.stringify(historyIndex));
    await KV.put(`history:${id}`, JSON.stringify(historyItem));

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
