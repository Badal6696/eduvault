// Cloudflare Pages Function - Hero Banner API
export async function onRequest(context) {
  const { DB } = context.env;
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'GET') {
    try {
      const result = await DB.prepare('SELECT * FROM hero_banner WHERE id = 1').first();
      return new Response(JSON.stringify(result || null), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { heroBanner } = await request.json();
      
      await DB.prepare(`
        INSERT OR REPLACE INTO hero_banner (id, title, description, btn1_text, btn1_link, btn2_text, btn2_link, image, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        heroBanner.title || 'Transform Your Learning Journey',
        heroBanner.description || '',
        heroBanner.btn1_text || '',
        heroBanner.btn1_link || '',
        heroBanner.btn2_text || '',
        heroBanner.btn2_link || '',
        heroBanner.image || '',
        new Date().toISOString()
      ).run();
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: corsHeaders
  });
}
