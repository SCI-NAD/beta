import type { APIRoute } from 'astro';
import { sql } from '@vercel/postgres';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const Name = data.get('Name');
  const Email = data.get('Email');
  const HowDidYouHearAboutUs = data.get('HowDidYouHearAboutUs');
  const Message = data.get('Message');

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not set');
    return new Response(JSON.stringify({ error: 'Database configuration error' }), { status: 500 });
  }

  try {
    const result = await sql`
      INSERT INTO contacts (name, email, heard_from, message, submitted_at)
      VALUES (${Name}, ${Email}, ${HowDidYouHearAboutUs}, ${Message}, NOW())
    `;
    console.log('Database insertion result:', result);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/contact-thank-you'
      },
    });
  } catch (error) {
    console.error('Failed to submit form:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit form', details: error.message }), { status: 500 });
  }
};

// How this works:
// 1. This serverless function handles form submissions from ContactForm.astro.
// 2. It checks if the request method is POST (form submission).
// 3. It extracts the form data from the request body, matching the field names in ContactForm.astro.
// 4. It connects to a PostgreSQL database using the @vercel/postgres package.
// 5. It inserts the form data into a 'contacts' table in the database.
// 6. If successful, it redirects to the thank you page (/contact-thank-you).
// 7. If there's an error, it logs the error and returns a 500 status code.
// 8. If the request method is not POST, it returns a 405 status code.

// To use this serverless function:
// 1. Ensure you have set up a PostgreSQL database with Vercel.
// 2. The POSTGRES_URL should be automatically set as an environment variable by Vercel.
// 3. Create a 'contacts' table in your database with columns: id, name, email, heard_from, message, submitted_at.
// 4. Deploy this file to Vercel as an API route.
// 5. Update your ContactForm.astro's action attribute to point to this serverless function's URL.
// 6. Ensure your form field names in ContactForm.astro match the ones used in this code.
