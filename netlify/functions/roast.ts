import type { Handler } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are a brutal, no-nonsense business turnaround expert evaluating a business website. You have been given the site's actual page content — title, meta description, headings, and copy.

Your job is to ROAST this website. Be aggressive, hilarious, and blunt. Quote the actual bad copy back at them. Call out weak headlines, vague value propositions, missing CTAs, and generic language. Your advice must be specific to what you actually read — not generic SEO tips.

Respond ONLY with a valid JSON object matching this structure:
{
  "shutdownGrade": "F" | "D" | "C" | "B" | "A",
  "theRoast": {
    "headline": "A brutal 5-7 word headline",
    "brutalSummary": "A 3-sentence aggressive summary of why this site is losing money. Quote their actual copy if it is bad."
  },
  "uxFailures": [ { "issue": "Specific UX problem observed", "fix": "Concrete fix" } ],
  "speedFailures": [ { "issue": "Specific copy or structure problem", "fix": "Concrete fix" } ],
  "copyFailures": [ { "issue": "Quote the bad copy or missing element", "fix": "What it should say instead" } ],
  "theBottomLine": "One final punchy sentence about the cost of doing nothing."
}`;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

function extractPageContent(html: string): string {
  // Strip scripts and styles first
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  const title = clean.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const metaDesc = clean.match(/name=["']description["'][^>]*content=["']([^"']{0,300})/i)?.[1]?.trim() || '';
  const h1s = [...clean.matchAll(/<h1[^>]*>([^<]{1,200})<\/h1>/gi)].map(m => m[1].trim()).slice(0, 2).join(' | ');
  const h2s = [...clean.matchAll(/<h2[^>]*>([^<]{1,150})<\/h2>/gi)].map(m => m[1].trim()).slice(0, 4).join(' | ');
  const h3s = [...clean.matchAll(/<h3[^>]*>([^<]{1,100})<\/h3>/gi)].map(m => m[1].trim()).slice(0, 4).join(' | ');

  // Extract button and CTA text
  const buttons = [...clean.matchAll(/<button[^>]*>([^<]{1,80})<\/button>/gi)].map(m => m[1].trim()).slice(0, 5).join(' | ');
  const links = [...clean.matchAll(/<a[^>]*>([^<]{1,80})<\/a>/gi)]
    .map(m => m[1].trim())
    .filter(t => t.length > 3 && !t.match(/^(home|menu|nav|skip|close)$/i))
    .slice(0, 8).join(' | ');

  // Extract visible paragraph text (first 1500 chars worth)
  const paragraphs = [...clean.matchAll(/<p[^>]*>([^<]{20,500})<\/p>/gi)]
    .map(m => m[1].trim())
    .slice(0, 6)
    .join(' ');

  return [
    title ? `TITLE: ${title}` : '',
    metaDesc ? `META DESCRIPTION: ${metaDesc}` : 'META DESCRIPTION: missing',
    h1s ? `H1: ${h1s}` : 'H1: missing',
    h2s ? `H2s: ${h2s}` : 'H2s: none found',
    h3s ? `H3s: ${h3s}` : '',
    buttons ? `BUTTONS/CTAs: ${buttons}` : 'BUTTONS/CTAs: none found',
    links ? `NAV/LINKS: ${links}` : '',
    paragraphs ? `COPY SAMPLE: ${paragraphs.slice(0, 1500)}` : 'COPY: none extracted',
  ].filter(Boolean).join('\n');
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'URL required' }) };

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Fetch the actual page HTML — much faster and more useful than PageSpeed
    let pageContext = '';
    try {
      const pageRes = await fetchWithTimeout(
        normalizedUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MJWAuditBot/1.0)',
            'Accept': 'text/html',
          },
        },
        8000
      );
      if (pageRes.ok) {
        const html = await pageRes.text();
        pageContext = extractPageContent(html);
        console.log('Page fetched successfully. Content length:', pageContext.length);
      } else {
        console.warn('Page fetch returned', pageRes.status);
      }
    } catch (e) {
      console.warn('Page fetch failed:', e instanceof Error ? e.message : e);
    }

    const userPrompt = pageContext
      ? `Roast this website. Here is what I found on the page:\n\nURL: ${normalizedUrl}\n\n${pageContext}\n\nDestroy them. Be specific — quote the bad copy back at them.`
      : `Roast this website based on its URL and industry alone. URL: ${normalizedUrl}. Make educated assumptions about what escape rooms and local businesses typically do wrong.`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      throw new Error(`Anthropic API error: ${errText}`);
    }

    const data = await claudeRes.json();
    let rawContent = data.content?.[0]?.text || '';
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const roastData = JSON.parse(rawContent);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: normalizedUrl,
        pageContextFound: !!pageContext,
        ...roastData,
      }),
    };
  } catch (err) {
    console.error('Roast function error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to roast website.' }),
    };
  }
};

export { handler };