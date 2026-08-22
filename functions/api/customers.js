// Cloudflare Pages Function - Customers API
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
      const { results } = await DB.prepare('SELECT id, full_name, email, contact, state, city, created_at FROM customers ORDER BY created_at DESC').all();
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
      const body = await request.json();
      const { action } = body;

      // Register new customer
      if (action === 'register') {
        const { full_name, email, contact, state, city, password } = body;
        
        if (!full_name || !email || !contact || !password) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Check if email already exists
        const existing = await DB.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first();
        if (existing) {
          return new Response(JSON.stringify({ error: 'Email already registered' }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const id = 'cust_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        
        await DB.prepare(`
          INSERT INTO customers (id, full_name, email, contact, state, city, password)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(id, full_name, email, contact, state || '', city || '', password).run();

        return new Response(JSON.stringify({ 
          success: true, 
          customer: { id, full_name, email, contact, state, city }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Login customer
      if (action === 'login') {
        const { email, password } = body;
        
        const customer = await DB.prepare('SELECT * FROM customers WHERE email = ? AND password = ?').bind(email, password).first();
        
        if (!customer) {
          return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
            status: 401,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          customer: { 
            id: customer.id, 
            full_name: customer.full_name, 
            email: customer.email,
            contact: customer.contact,
            state: customer.state,
            city: customer.city
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: corsHeaders
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
