// Cloudflare Pages Function - Courses API
export async function onRequest(context) {
  const { DB } = context.env;
  const { request } = context;

  // Handle CORS
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
      const { results } = await DB.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
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
      const { courses } = await request.json();
      
      // Delete all existing courses
      await DB.prepare('DELETE FROM courses').run();
      
      // Insert new courses
      for (const course of courses) {
        await DB.prepare(`
          INSERT INTO courses (id, title, description, price, discount, img, pdf)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          course.id,
          course.title,
          course.description || '',
          course.price || 0,
          course.discount || 0,
          course.img || '',
          course.pdf || null
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
