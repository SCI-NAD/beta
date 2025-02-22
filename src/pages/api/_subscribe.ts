import type { APIRoute } from 'astro';
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    console.log('Received body:', body);

    let email;
    try {
      const data = JSON.parse(body);
      email = data.email;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return new Response(
        JSON.stringify({ message: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const { rows } = await pool.query('SELECT * FROM subscriptions WHERE email = $1', [email]);
    if (rows.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Email already subscribed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert new email
    await pool.query('INSERT INTO subscriptions (email) VALUES ($1)', [email]);

    return new Response(
      JSON.stringify({ message: 'Thank you for subscribing!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(
      JSON.stringify({ message: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Add this line to handle OPTIONS requests (for CORS preflight)
export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};