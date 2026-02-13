import type { APIRoute } from 'astro';
import { getDirectusInternalUrl } from '../../lib/config';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // 1. Validasi Sederhana
    if (!data.email || !data.firstName) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    // 2. Kirim ke Directus dari Sisi Server (Aman)
    const baseUrl = getDirectusInternalUrl();

    const targetUrl = `${baseUrl}/items/quotations`;

    console.log("Proxying RFQ to:", targetUrl);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Directus API rejected the request");
    }

    return new Response(JSON.stringify({ message: 'Success' }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
