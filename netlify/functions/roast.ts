import type { Handler } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are a brutal, no-nonsense business turnaround expert in the style of Jon Taffer. You are evaluating a business website. You have been provided with Google PageSpeed data and a screenshot of the site.

Your job is to ROAST this website. Be aggressive, hilarious, and blunt, but your underlying advice MUST be technically accurate and highly actionable. Point out terrible UX, slow load times, confusing copy, and lack of clear CTAs.

Respond ONLY with a valid JSON object matching this structure:
{
  "tafferGrade": "F" | "D" | "C" | "B" | "A",
  "theRoast": {
    "headline": "A brutal 5-7 word headline",
    "brutalSummary": "A 3-sentence aggressive summary of why this site is losing money."
  },
  "uxFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "speedFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "copyFailures": [ { "issue": "What's wrong", "fix": "How to fix it" } ],
  "theBottomLine": "One final punchy sentence about the cost of doing nothing."
}`;

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'URL required' }) };

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const screenshotApiKey = process.env.SCREENSHOTONE_ACCESS_KEY || '';
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotApiKey}&url=${encodeURIComponent(normalizedUrl)}&full_page=false&viewport_width=1280&viewport_height=800&format=jpg&image_quality=80`;

    const pageSpeedKey = process.env.PAGESPEED_API_KEY || '';
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&key=${pageSpeedKey}`;

    let performanceScore = 0;
    let mobileFriendly = true;
    try {
      const psRes = await fetch(psUrl);
      if (psRes.ok) {
        const psData = await psRes.json();
        performanceScore = Math.round((psData.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
        mobileFriendly = psData.lighthouseResult?.audits?.viewport?.score === 1;
      }
    } catch (e) {
      console.warn('PageSpeed failed, continuing with vision only.');
    }

    const userPrompt = `Here is the website screenshot and data.\nURL: ${normalizedUrl}\nMobile Performance Score: ${performanceScore}/100\nMobile Friendly: ${mobileFriendly}\n\nRoast it.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: screenshotUrl } },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error('Anthropic API error');
    const data = await response.json();

    let rawContent = data.content?.[0]?.text || '';
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const roastData = JSON.parse(rawContent);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: normalizedUrl,
        screenshotUrl,
        performanceScore,
        mobileFriendly,
        ...roastData,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to roast website.' }) };
  }
};

export { handler };
