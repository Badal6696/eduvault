// Cloudflare Pages Function - Footer API
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
      const result = await DB.prepare('SELECT * FROM footer WHERE id = 1').first();
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
      const { footer } = await request.json();
      
      await DB.prepare(`
        INSERT OR REPLACE INTO footer (id, col1_title, col1_desc, email, phone, copyright, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?)
      `).bind(
        footer.col1Title || 'EduVault',
        footer.col1Desc || '',
        footer.email || '',
        footer.phone || '',
        footer.copyright || '© 2026 EduVault. All rights reserved.',
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
