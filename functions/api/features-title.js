// Cloudflare Pages Function - Features Title API
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
      const result = await DB.prepare('SELECT * FROM features_title WHERE id = 1').first();
      return new Response(JSON.stringify(result || { title: 'Why Choose EduVault?' }), {
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
      const { title } = await request.json();
      
      await DB.prepare(`
        INSERT OR REPLACE INTO features_title (id, title, updated_at)
        VALUES (1, ?, ?)
      `).bind(
        title || 'Why Choose EduVault?',
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
