const fs = require('fs');
const path = require('path');

const base = 'C:/Users/Jens/Documents/GitHub/fordify-app';
const outDir = path.join(base, 'docs/legal-review');

function decode(h) {
  return h
    .replace(/&auml;/g, 'ä').replace(/&uuml;/g, 'ü').replace(/&ouml;/g, 'ö')
    .replace(/&Auml;/g, 'Ä').replace(/&Uuml;/g, 'Ü').replace(/&Ouml;/g, 'Ö')
    .replace(/&szlig;/g, 'ß').replace(/&eacute;/g, 'é')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&bdquo;/g, '„').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ').replace(/&shy;/g, '').replace(/&copy;/g, '©')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function inner(tag, s) {
  // Extract first tag's inner content without crossing nested same-tag boundaries
  const re = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'gi');
  return s.replace(re, (m, t) => t);
}

function t(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function convert(raw) {
  let h = raw;

  // Strip unwanted blocks completely
  h = h.replace(/<head\b[\s\S]*?<\/head>/gi, '');
  h = h.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  h = h.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  h = h.replace(/<nav\b[\s\S]*?<\/nav>/gi, '');
  h = h.replace(/<footer\b[\s\S]*?<\/footer>/gi, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');

  // Strip prefooter div (contains CTA, not legal content)
  h = h.replace(/<div[^>]*class="prefooter[^"]*"[\s\S]*?(?=<footer|<div[^>]*class="modal)/gi, '');

  // Strip login modal
  h = h.replace(/<div[^>]*id="loginModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');

  // Strip skip-nav and back-link anchors
  h = h.replace(/<a[^>]*class="(?:skip-nav|back-link)"[^>]*>[\s\S]*?<\/a>/gi, '');

  // Strip print/konto buttons (AVV)
  h = h.replace(/<div[^>]*class="mt-5[\s\S]*?<\/div>/gi, '');

  // Replace div/structural wrappers with newlines (content preserved)
  h = h.replace(/<\/div>/gi, '\n');
  h = h.replace(/<div[^>]*>/gi, '\n');
  h = h.replace(/<\/?(body|html|main|section|article|header|aside|form)[^>]*>/gi, '\n');

  // Headings — use [^<]* to prevent crossing tag boundaries
  h = h.replace(/<h1[^>]*>([^<]*(?:<(?!\/h1)[^<]*)*)<\/h1>/gi, (_, c) => '\n\n# ' + t(c) + '\n\n');
  h = h.replace(/<h2[^>]*>([^<]*(?:<(?!\/h2)[^<]*)*)<\/h2>/gi, (_, c) => '\n\n## ' + t(c) + '\n\n');
  h = h.replace(/<h3[^>]*>([^<]*(?:<(?!\/h3)[^<]*)*)<\/h3>/gi, (_, c) => '\n\n### ' + t(c) + '\n\n');
  h = h.replace(/<h4[^>]*>([^<]*(?:<(?!\/h4)[^<]*)*)<\/h4>/gi, (_, c) => '\n\n#### ' + t(c) + '\n\n');
  h = h.replace(/<h5[^>]*>([^<]*(?:<(?!\/h5)[^<]*)*)<\/h5>/gi, (_, c) => '\n\n##### ' + t(c) + '\n\n');

  // Lists
  h = h.replace(/<li[^>]*>([^<]*(?:<(?!\/li)[^<]*)*)<\/li>/gi, (_, c) => '- ' + t(c) + '\n');
  h = h.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Inline: bold, italic (single-level only)
  h = h.replace(/<(?:strong|b)>([^<]*)<\/(?:strong|b)>/gi, (_, c) => '**' + c.trim() + '**');
  h = h.replace(/<(?:em|i)>([^<]*)<\/(?:em|i)>/gi, (_, c) => '*' + c.trim() + '*');

  // Links
  h = h.replace(/<a\s[^>]*href="(mailto:[^"]*)"[^>]*>([^<]*)<\/a>/gi, (_, href, c) => '[' + c.trim() + '](' + href + ')');
  h = h.replace(/<a\s[^>]*href="(https?:[^"]*)"[^>]*>([^<]*)<\/a>/gi, (_, href, c) => '[' + c.trim() + '](' + href + ')');
  h = h.replace(/<a[^>]*>([^<]*)<\/a>/gi, (_, c) => c.trim());

  // Breaks
  h = h.replace(/<br\s*\/?>/gi, '\n');
  h = h.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // Paragraphs
  h = h.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => {
    const text = c.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text + '\n\n' : '';
  });

  // Address block
  h = h.replace(/<address[^>]*>([\s\S]*?)<\/address>/gi, (_, c) => {
    return c.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/\n+/g, '\n').trim() + '\n\n';
  });

  // Strip all remaining HTML tags
  h = h.replace(/<[^>]+>/g, '');

  // Decode HTML entities (including UTF-8 passthrough)
  h = decode(h);

  // Normalize whitespace
  h = h.replace(/\r/g, '');
  h = h.replace(/[ \t]+\n/g, '\n');
  h = h.replace(/\n[ \t]+/g, '\n');
  h = h.replace(/[ \t]{2,}/g, ' ');
  h = h.replace(/\n{3,}/g, '\n\n');

  return h.trim() + '\n';
}

const files = {
  impressum:   'frontend/impressum.html',
  datenschutz: 'frontend/datenschutz.html',
  agb:         'frontend/agb.html',
  avv:         'frontend/avv.html',
};

for (const [name, rel] of Object.entries(files)) {
  const raw  = fs.readFileSync(path.join(base, rel), 'utf8');
  const md   = convert(raw);
  const dest = path.join(outDir, name + '.md');
  fs.writeFileSync(dest, md, 'utf8');
  const lines    = md.split('\n').length;
  const headings = (md.match(/^#{1,5} /gm) || []).length;
  const h2       = (md.match(/^## /gm) || []).length;
  console.log('OK: ' + name + '.md — ' + lines + ' Zeilen, ' + headings + ' Ueberschriften (' + h2 + ' Abschnitte)');
}
