import type { APIRoute } from 'astro';
import { getDirectusInternalUrl } from '../../lib/config';

// ── Simple In-Memory Rate Limiter ──────────────────────────
// Untuk Cloudflare Workers, disarankan gunakan Cloudflare Rate Limiting Rules
// di dashboard sebagai lapisan pertama. Ini adalah lapisan kedua (defense-in-depth).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 request per menit per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Bersihkan entry yang sudah expired
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(ip);
  }

  const current = rateLimitMap.get(ip);

  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count++;
  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

// ── Input Validation ───────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const ALLOWED_INDUSTRIES = [
  'ecommerce', 'healthcare', 'automotive',
  'technology', 'consumer-goods', 'food-beverage', 'other'
];
const ALLOWED_SERVICES = [
  'storage-optimization', 'vertical-storage', 'automated-sorting',
  'intelligent-transport', 'ergonomic-handling', 'transport-handling'
];
const MAX_STRING_LENGTH = 1000;
const MAX_DETAILS_LENGTH = 5000;

interface ValidationError {
  field: string;
  message: string;
}

function validatePayload(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Cek tipe data dasar
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return [{ field: 'body', message: 'Request body must be a JSON object' }];
  }

  // firstName: required, string, max length
  if (!data.firstName || typeof data.firstName !== 'string') {
    errors.push({ field: 'firstName', message: 'firstName is required and must be a string' });
  } else if (data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'firstName cannot be empty' });
  } else if (data.firstName.length > MAX_STRING_LENGTH) {
    errors.push({ field: 'firstName', message: `firstName exceeds ${MAX_STRING_LENGTH} characters` });
  }

  // email: required, valid format
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'email is required and must be a string' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  } else if (data.email.length > 254) {
    errors.push({ field: 'email', message: 'Email exceeds maximum length' });
  }

  // phone: required, valid format
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push({ field: 'phone', message: 'phone is required and must be a string' });
  } else if (!PHONE_REGEX.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format' });
  }

  // company: required, string, max length
  if (!data.company || typeof data.company !== 'string') {
    errors.push({ field: 'company', message: 'company is required and must be a string' });
  } else if (data.company.length > MAX_STRING_LENGTH) {
    errors.push({ field: 'company', message: `company exceeds ${MAX_STRING_LENGTH} characters` });
  }

  // industry: required, must be from allowed list
  if (!data.industry || typeof data.industry !== 'string') {
    errors.push({ field: 'industry', message: 'industry is required' });
  } else if (!ALLOWED_INDUSTRIES.includes(data.industry)) {
    errors.push({ field: 'industry', message: 'Invalid industry value' });
  }

  // services: optional array, each must be from allowed list
  if (data.services !== undefined) {
    if (!Array.isArray(data.services)) {
      errors.push({ field: 'services', message: 'services must be an array' });
    } else if (data.services.length > ALLOWED_SERVICES.length) {
      errors.push({ field: 'services', message: 'Too many services selected' });
    } else {
      for (const svc of data.services) {
        if (typeof svc !== 'string' || !ALLOWED_SERVICES.includes(svc)) {
          errors.push({ field: 'services', message: `Invalid service: ${String(svc).substring(0, 50)}` });
          break;
        }
      }
    }
  }

  // details: required, string, max length
  if (!data.details || typeof data.details !== 'string') {
    errors.push({ field: 'details', message: 'details is required and must be a string' });
  } else if (data.details.trim().length === 0) {
    errors.push({ field: 'details', message: 'details cannot be empty' });
  } else if (data.details.length > MAX_DETAILS_LENGTH) {
    errors.push({ field: 'details', message: `details exceeds ${MAX_DETAILS_LENGTH} characters` });
  }

  return errors;
}

/**
 * Bersihkan payload — hanya teruskan field yang diizinkan ke Directus
 * Ini mencegah prototype pollution dan extra field injection
 */
function sanitizePayload(data: any) {
  return {
    firstName: String(data.firstName).trim().substring(0, MAX_STRING_LENGTH),
    email: String(data.email).trim().toLowerCase(),
    phone: String(data.phone).trim(),
    company: String(data.company).trim().substring(0, MAX_STRING_LENGTH),
    industry: String(data.industry),
    services: Array.isArray(data.services)
      ? data.services.filter((s: string) => ALLOWED_SERVICES.includes(s))
      : [],
    details: String(data.details).trim().substring(0, MAX_DETAILS_LENGTH),
    status: 'published',
  };
}

// ── API Handler ────────────────────────────────────────────
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Rate Limiting
    const clientIp = clientAddress ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown';

    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ message: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // 2. Content-Type check
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ message: 'Content-Type must be application/json' }),
        { status: 415, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Body size check (reject > 100KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100_000) {
      return new Response(
        JSON.stringify({ message: 'Request body too large' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse JSON
    let data: any;
    try {
      data = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ message: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Validate
    const errors = validatePayload(data);
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Validation failed', errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Sanitize — hanya teruskan field yang diizinkan
    const cleanPayload = sanitizePayload(data);

    // 7. Kirim ke Directus
    const baseUrl = getDirectusInternalUrl();
    const targetUrl = `${baseUrl}/items/quotations`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload),
    });

    if (!response.ok) {
      // Jangan expose error detail dari Directus ke client
      return new Response(
        JSON.stringify({ message: 'Failed to process your request. Please try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Success' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    // Jangan expose internal error ke client
    return new Response(
      JSON.stringify({ message: 'An unexpected error occurred. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
