export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    if (!supabaseUrl) {
      return res.status(500).json({ error: "SUPABASE_URL env var not set" });
    }

    const url = `${supabaseUrl}/rest/v1/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase responded with ${response.status}`);
    }

    res.status(200).json({ ok: true, pinged: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
