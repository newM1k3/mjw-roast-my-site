import type { Handler } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are a brutal, no-nonsense business turnaround expert. You are evaluating a business website based on its URL and Google PageSpeed performance data.

Your job is to ROAST this website. Be aggressive, hilarious, and blunt, but your underlying advice MUST be technically accurate and highly actionable. Point out likely UX problems, slow load times, confusing copy, and lack of clear CTAs based on what you know about the industry and the performance data provided.

Respond ONLY with a valid JSON object matching this structure:
{
  "shutdownGrade": "F" | "D" | "C" | "B" | "A",
  "theRoast": {
    "headline": "A brutal 5-7 word headline",
    "brutalSummary": "A 3-sentence aggressive summary of why this site is losing money."
  },
  "uxFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "speedFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "copyFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "theBottomLine": "One final punchy sentence about the cost of doing nothing."
}`;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'URL required' }) };

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const pageSpeedKey = process.env.PAGESPEED_API_KEY || '';
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&key=${pageSpeedKey}`;

    // PageSpeed with 10s timeout
    let performanceScore = 0;
    let mobileFriendly = true;
    let fcp = 'unknown';
    let lcp = 'unknown';
    let cls = 'unknown';

    try {
      const psRes = await fetchWithTimeout(psUrl, {}, 10000);
      if (psRes.ok) {
        const psData = await psRes.json();
        const audits = psData.lighthouseResult?.audits;
        const categories = psData.lighthouseResult?.categories;
        performanceScore = Math.round((categories?.performance?.score ?? 0) * 100);
        mobileFriendly = audits?.viewport?.score === 1;
        fcp = audits?.['first-contentful-paint']?.displayValue || 'unknown';
        lcp = audits?.['largest-contentful-paint']?.displayValue || 'unknown';
        cls = audits?.['cumulative-layout-shift']?.displayValue || 'unknown';
      }
    } catch (e) {
      console.warn('PageSpeed timed out or failed, continuing without it.');
    }

    const userPrompt = `Roast this website brutally.
URL: ${normalizedUrl}
Mobile Performance Score: ${performanceScore}/100
Mobile Friendly: ${mobileFriendly}
First Contentful Paint: ${fcp}
Largest Contentful Paint: ${lcp}
Cumulative Layout Shift: ${cls}

Based on the URL, industry, and these performance metrics — destroy them.`;

    const claudeRes = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      },
      12000
    );

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
        performanceScore,
        mobileFriendly,
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