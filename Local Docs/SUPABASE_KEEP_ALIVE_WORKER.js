/**
 * Supabase Keep-Alive Worker
 * Frequency: Every 3 days (cron: 0 0 */3 * *)
 * Purpose: Prevents Supabase free tier from pausing by making a direct REST API call.
 */

export default {
  async scheduled(event, env, ctx) {
    const SUPABASE_URL = env.SUPABASE_URL; // e.g. https://[REF].supabase.co
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
      return;
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log(`✅ Supabase Keep-Alive Success: ${response.status}`);
      } else {
        console.error(`❌ Supabase Keep-Alive Failed: ${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.error(`❌ Supabase Keep-Alive Error: ${error.message}`);
    }
  },
};
