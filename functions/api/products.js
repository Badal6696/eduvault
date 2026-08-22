// Cloudflare Pages Function - Products API
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
      const { results } = await DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
      return new Response(JSON.stringify(results || []), {
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
      const { products } = await request.json();
      
      await DB.prepare('DELETE FROM products').run();
      
      for (const product of products) {
        await DB.prepare(`
          INSERT INTO products (id, title, description, price, img, pdf, kicker)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          product.id,
          product.title,
          product.description || '',
          product.price || 0,
          product.img || '',
          product.pdf || null,
          product.kicker || 'Product'
        ).run();
      }
      
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
