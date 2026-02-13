/**
 * CONFIG SECURITY RULE:
 * 1. PUBLIC_URL: Boleh diekspos ke browser (untuk fetch gambar/katalog).
 * 2. INTERNAL_URL: HANYA untuk server-side (node). Tidak boleh bocor ke browser.
 */

// Helper untuk URL Publik (Browser & Server)
export const getDirectusPublicUrl = () => {
  // Astro secara otomatis mengosongkan import.meta.env di browser untuk keamanan 
  // kecuali yang memiliki prefix PUBLIC_
  const url = import.meta.env.PUBLIC_DIRECTUS_URL ||
    (typeof process !== 'undefined' ? process.env.PUBLIC_DIRECTUS_URL : undefined);

  if (!url && import.meta.env.PROD) {
    throw new Error("SECURITY ALERT: PUBLIC_DIRECTUS_URL is missing in Production environment!");
  }

  return url || 'https://dapur.solusigudang.id'; // Fallback hanya untuk development
};

// Helper untuk URL Internal (HANYA Server-side)
export const getDirectusInternalUrl = () => {
  // Jika di browser, jangan pernah berikan URL internal
  if (typeof window !== 'undefined') {
    return getDirectusPublicUrl();
  }

  const internalUrl = import.meta.env.DIRECTUS_URL_INTERNAL ||
    (typeof process !== 'undefined' ? process.env.DIRECTUS_URL_INTERNAL : undefined);

  // Jika sedang di server (SSR), utamakan internal, jika tidak ada baru pakai public
  return internalUrl || getDirectusPublicUrl();
};
