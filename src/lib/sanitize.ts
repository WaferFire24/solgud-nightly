/**
 * Server-side HTML Sanitizer
 * Membersihkan konten HTML dari CMS sebelum dirender via set:html
 * 
 * Whitelist approach: hanya tag & atribut yang aman yang diizinkan.
 * Semua <script>, event handler (onclick, onerror, dll), dan 
 * protocol berbahaya (javascript:, data:, vbscript:) akan dihapus.
 */

// Tag HTML yang diizinkan untuk konten CMS
const ALLOWED_TAGS = new Set([
    // Blok
    'p', 'div', 'span', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'code',
    // List
    'ul', 'ol', 'li',
    // Tabel
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Inline formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup', 'small',
    // Media
    'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
    // Link
    'a',
    // Semantic
    'article', 'section', 'aside', 'header', 'footer', 'main', 'nav', 'details', 'summary',
    // Misc
    'abbr', 'cite', 'dfn', 'kbd', 'samp', 'var', 'time', 'address',
]);

// Atribut yang diizinkan per tag (atau '*' untuk semua tag)
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
    '*': new Set(['class', 'id', 'title', 'lang', 'dir', 'role', 'aria-label', 'aria-hidden', 'style']),
    'a': new Set(['href', 'target', 'rel', 'download']),
    'img': new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
    'source': new Set(['src', 'srcset', 'type', 'media', 'sizes']),
    'video': new Set(['src', 'poster', 'width', 'height', 'controls', 'autoplay', 'muted', 'loop', 'preload']),
    'audio': new Set(['src', 'controls', 'autoplay', 'muted', 'loop', 'preload']),
    'td': new Set(['colspan', 'rowspan', 'headers']),
    'th': new Set(['colspan', 'rowspan', 'scope', 'headers']),
    'col': new Set(['span']),
    'colgroup': new Set(['span']),
    'time': new Set(['datetime']),
    'blockquote': new Set(['cite']),
    'ol': new Set(['start', 'type', 'reversed']),
};

// Protocol berbahaya yang harus diblokir di URL
const DANGEROUS_PROTOCOLS = /^\s*(javascript|vbscript|data|blob):/i;

// Event handler pattern (on*)
const EVENT_HANDLER_REGEX = /^on\w+$/i;

// CSS expression/behavior (untuk style attribute)
const DANGEROUS_CSS = /expression\s*\(|behavior\s*:|url\s*\(\s*["']?\s*javascript/i;

/**
 * Sanitize HTML string dari konten CMS
 * Menggunakan regex-based parser yang cukup untuk server-side Astro rendering
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
    if (!dirty) return '';

    let clean = dirty;

    // 1. Hapus semua <script> dan isinya
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 2. Hapus semua <style> dan isinya (bisa mengandung expression())
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // 3. Hapus HTML comments (bisa mengandung conditional IE comments dengan script)
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');

    // 4. Process setiap tag HTML
    clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tagName, attrs) => {
        const tag = tagName.toLowerCase();
        const isClosing = match.startsWith('</');

        // Hapus tag yang tidak di-whitelist
        if (!ALLOWED_TAGS.has(tag)) {
            return '';
        }

        // Closing tag tidak perlu atribut
        if (isClosing) {
            return `</${tag}>`;
        }

        // Sanitize atribut
        const cleanAttrs = sanitizeAttributes(tag, attrs || '');
        const selfClosing = match.endsWith('/>') ? ' /' : '';

        return `<${tag}${cleanAttrs}${selfClosing}>`;
    });

    // 5. Hapus pola berbahaya yang mungkin lolos
    // Remove <![CDATA[...]]>
    clean = clean.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

    // Remove processing instructions <?...?>
    clean = clean.replace(/<\?[\s\S]*?\?>/g, '');

    return clean;
}

/**
 * Sanitize atribut dari sebuah tag HTML
 */
function sanitizeAttributes(tag: string, attrsString: string): string {
    if (!attrsString.trim()) return '';

    const globalAllowed = ALLOWED_ATTRIBUTES['*'] || new Set();
    const tagAllowed = ALLOWED_ATTRIBUTES[tag] || new Set();

    const result: string[] = [];

    // Parse atribut menggunakan regex
    const attrRegex = /([a-zA-Z][a-zA-Z0-9_-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

        // Blokir semua event handlers (onclick, onerror, onload, dll)
        if (EVENT_HANDLER_REGEX.test(attrName)) {
            continue;
        }

        // Cek apakah atribut diizinkan
        if (!globalAllowed.has(attrName) && !tagAllowed.has(attrName)) {
            continue;
        }

        // Sanitize value berdasarkan konteks
        let cleanValue = attrValue;

        // Untuk href/src, blokir protocol berbahaya
        if (attrName === 'href' || attrName === 'src' || attrName === 'srcset') {
            if (DANGEROUS_PROTOCOLS.test(cleanValue)) {
                continue; // Skip atribut ini sepenuhnya
            }
        }

        // Untuk style, blokir CSS expression/behavior
        if (attrName === 'style') {
            if (DANGEROUS_CSS.test(cleanValue)) {
                continue;
            }
        }

        // Untuk target di link, hanya izinkan _blank (dan tambahkan rel)
        if (attrName === 'target' && tag === 'a') {
            cleanValue = '_blank';
        }

        // Escape value
        cleanValue = cleanValue
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        result.push(`${attrName}="${cleanValue}"`);
    }

    // Untuk link dengan target=_blank, pastikan ada rel="noopener noreferrer"
    if (tag === 'a' && result.some(a => a.startsWith('target='))) {
        if (!result.some(a => a.startsWith('rel='))) {
            result.push('rel="noopener noreferrer"');
        }
    }

    return result.length > 0 ? ' ' + result.join(' ') : '';
}
