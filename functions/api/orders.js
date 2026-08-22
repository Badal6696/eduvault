// Cloudflare Pages Function - Orders API
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
      const { results } = await DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      // Parse items JSON for each order
      const orders = results.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      }));
      return new Response(JSON.stringify(orders), {
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
      const { order } = await request.json();
      
      // Generate unique order ID
      order.id = 'ORD-' + Date.now().toString(36).toUpperCase();
      order.status = 'completed';
      order.created_at = new Date().toISOString();
      
      // Generate access token
      order.access_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Generate download links and set expiry
      order.items = order.items.map(item => ({
        ...item,
        downloadLink: `/api/download?token=${order.access_token}&item=${item.id}`,
        accessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // Store items as JSON string
      const itemsJson = JSON.stringify(order.items);
      
      await DB.prepare(`
        INSERT INTO orders (id, razorpay_payment_id, customer_email, customer_name, items, total, status, access_token, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        order.id,
        order.razorpay_payment_id || '',
        order.customer_email || '',
        order.customer_name || '',
        itemsJson,
        order.total || 0,
        order.status,
        order.access_token,
        order.created_at
      ).run();
      
      return new Response(JSON.stringify({ success: true, order }), {
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
