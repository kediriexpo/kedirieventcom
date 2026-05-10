const fs = require('fs');
const path = require('path');

const p = 'c:\\event\\kedirievent';
const files = [
    'detail-pelatihan-digital.html',
    'detail-forum-literasi.html',
    'detail-content-creator.html',
    'detail-fashion-batik.html',
    'detail-school-contest.html',
    'detail-freefire-battle.html',
    'detail-mobile-legends.html',
    'detail-fun-walk-nganjuk.html',
    'detail-lomba-poster.html',
    'detail-sekolah-inflasi.html',
    'detail-school-contest-2024.html',
    'program-scholarship-camp-global-english.html',
    'program-holiday-global-english.html'
];

function sanitizeStr(str) {
    if (!str) return '';
    return str.replace(/<[^>]+>/g, '').replace(/\r?\n|\r/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 160);
}

files.forEach(f => {
    const filePath = path.join(p, f);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${f}, not found.`);
        return;
    }
    let c = fs.readFileSync(filePath, 'utf8');

    // Extract variables needed
    const h1Match = c.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim() : 'Detail Event';

    const pMatch = c.match(/<div class=\"content-body[^>]*>\s*(<p>[\s\S]*?<\/p>)/i);
    let description = "Informasi detail event terlengkap di Kediri Event.";
    if (pMatch) {
        description = sanitizeStr(pMatch[1]);
    }

    const imgMatch = c.match(/<img[^>]*src=\"(assets\/img\/[^\"]+)\"[^>]*alt=\"[^\"]*\"/i);
    const imageSrc = imgMatch ? 'https://kedirievent.com/' + imgMatch[1] : 'https://kedirievent.com/assets/img/kediri-event-cover.jpg';

    const canonicalUrl = `https://kedirievent.com/${f}`;

    // 1. UPDATE SEO IN THE HEAD
    c = c.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title} - Kediri Event</title>`);
    c = c.replace(/<meta name=\"description\" content=\"[^\"]*\">/i, `<meta name="description" content="${description}">`);
    c = c.replace(/<link rel=\"canonical\" href=\"[^\"]*\">/i, `<link rel="canonical" href="${canonicalUrl}">`);

    // AEO and GEO update
    const headEndRegex = /(<\/head>)/i;
    // Make sure we have the GEO meta tags, if not add them before </head>
    if (!c.includes('<meta name="geo.region"')) {
        c = c.replace(headEndRegex, `  <meta name="geo.region" content="ID-JI">\n  <meta name="geo.placename" content="Kediri">\n  <meta name="geo.position" content="-7.8166;112.0166">\n  <meta name="ICBM" content="-7.8166, 112.0166">\n$1`);
    }

    // Rewrite OG and Twitter
    c = c.replace(/<meta property=\"og:url\" content=\"[^\"]*\">/i, `<meta property="og:url" content="${canonicalUrl}">`);
    c = c.replace(/<meta property=\"og:title\" content=\"[^\"]*\">/i, `<meta property="og:title" content="${title} - Kediri Event">`);
    c = c.replace(/<meta property=\"og:description\" content=\"[^\"]*\">/i, `<meta property="og:description" content="${description}">`);
    c = c.replace(/<meta property=\"og:image\" content=\"[^\"]*\">/i, `<meta property="og:image" content="${imageSrc}">`);

    c = c.replace(/<meta name=\"twitter:url\" content=\"[^\"]*\">/i, `<meta name="twitter:url" content="${canonicalUrl}">`);
    c = c.replace(/<meta name=\"twitter:title\" content=\"[^\"]*\">/i, `<meta name="twitter:title" content="${title} - Kediri Event">`);
    c = c.replace(/<meta name=\"twitter:description\" content=\"[^\"]*\">/i, `<meta name="twitter:description" content="${description}">`);
    c = c.replace(/<meta name=\"twitter:image\" content=\"[^\"]*\">/i, `<meta name="twitter:image" content="${imageSrc}">`);

    // Rewrite JSON-LD Schema
    c = c.replace(/"name": "Template[^"]*"/g, `"name": "${title} - Kediri Event"`);
    c = c.replace(/"description": "Template[^"]*"/g, `"description": "${description}"`);
    c = c.replace(/"url": "https:\/\/kedirievent\.com\/mentahan\.html"/g, `"url": "${canonicalUrl}"`);
    c = c.replace(/"url": "https:\/\/kedirievent\.com\/assets\/img\/kediri-event-cover\.jpg"/g, `"url": "${imageSrc}"`);

    // Fix favicon size redundancy
    c = c.replace(/<link rel="icon" type="image\/png" sizes="32x32" href="assets\/img\/logo2 square.png">\s*<link rel="icon" type="image\/png" sizes="32x32" href="assets\/img\/logo2 square.png">/i, '<link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo2 square.png">\n  <link rel="icon" type="image/png" sizes="16x16" href="assets/img/logo2 square.png">');

    // UPDATE WHATSAPP NUMBER
    // Update +62 895-6390-68080 and 62895639068080 where WhatsApp numbers are
    // E.g. <p class="mt-4"><strong>WhatsApp:</strong> <span>+62 813-3109-7278</span></p> or whatever format
    // We can just find the pattern "+62 ..." and replace in context.
    // We will selectively target the WA numbers in footer and the wa.me links.

    c = c.replace(/<strong>WhatsApp:<\/strong>\s*<span>[^<]+<\/span>/gi, `<strong>WhatsApp:</strong> <span>+62 895-6390-68080</span>`);

    // wa.me links
    c = c.replace(/wa\.me\/[0-9]+\?/gi, `wa.me/62895639068080?`);

    // Find all images within main and apply loading="lazy" if missing, except the first one and the header logo
    // Actually, doing this with regex is a bit risky if they already have them. 
    // For the images in content-body let's just do a naive check:
    const offset = c.indexOf('<main class="main">');
    if (offset !== -1) {
        let beforeMain = c.substring(0, offset);
        let inMain = c.substring(offset);
        inMain = inMain.replace(/<img([^>]*)>/gi, (match, attrs) => {
            if (!attrs.includes('loading=')) {
                return `<img${attrs} loading="lazy" decoding="async">`;
            }
            return match;
        });
        c = beforeMain + inMain;
    }

    // Ensure 'robots' meta is index, follow since these are actual pages, not mentahan!
    c = c.replace(/<meta name=\"robots\" content=\"noindex, nofollow\">/i, `<meta name="robots" content="index, follow">`);
    c = c.replace(/<meta name=\"googlebot\" content=\"noindex, nofollow, max-snippet:-1, max-image-preview:large, max-video-preview:-1\">/i, `<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`);

    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Updated ${f}`);
});

console.log('Done script.');
