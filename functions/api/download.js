// Cloudflare Pages Function - Download API (PDF delivery)
export async function onRequest(context) {
  const { DB } = context.env;
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      const itemId = url.searchParams.get('item');

      if (!token || !itemId) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Find order with this access token
      const order = await DB.prepare('SELECT * FROM orders WHERE access_token = ?').bind(token).first();

      if (!order) {
        return new Response(JSON.stringify({ error: 'Access denied - Invalid token' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      // Parse items
      const items = JSON.parse(order.items || '[]');
      const purchasedItem = items.find(i => i.id === itemId);

      if (!purchasedItem) {
        return new Response(JSON.stringify({ error: 'Item not found in this order' }), {
          status: 404,
          headers: corsHeaders
        });
      }

      // Check if access has expired
      if (new Date(purchasedItem.accessExpiry) < new Date()) {
        return new Response(JSON.stringify({ error: 'Access has expired' }), {
          status: 403,
          headers: corsHeaders
        });
      }

      // Check if item has PDF data
      if (purchasedItem.pdf) {
        const pdfData = purchasedItem.pdf;
        
        // Extract base64 data
        const matches = pdfData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const base64Data = matches[2];
          
          // Convert base64 to binary
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          // Return PDF file
          return new Response(bytes, {
            headers: {
              ...corsHeaders,
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${purchasedItem.name || 'download'}.pdf"`,
              'Content-Length': bytes.length.toString()
            }
          });
        }
      }

      // If no PDF data, return info message
      return new Response(JSON.stringify({
        message: 'Access granted',
        item: {
          title: purchasedItem.name,
          description: purchasedItem.description || 'Digital product',
          accessUntil: purchasedItem.accessExpiry,
          note: 'No PDF file available for this item'
        }
      }), {
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
