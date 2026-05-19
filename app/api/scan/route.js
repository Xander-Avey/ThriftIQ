export const runtime = 'edge';

export async function POST(request) {
  try {
    const { imageBase64, mediaType } = await request.json();

    if (!imageBase64 || !mediaType) {
      return Response.json({ error: 'Missing image data' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `You are ThriftIQ, an AI that analyzes thrifted items for resale value. Analyze this item and respond ONLY with a JSON object, no markdown, no backticks, no extra text. Use this exact structure:
{
  "verdict": "FLIP" or "SKIP",
  "itemName": "specific item name and brand if visible",
  "condition": "Excellent / Good / Fair / Poor",
  "resaleValue": { "low": number, "high": number },
  "profitPotential": "$X - $Y profit",
  "sellIn": "X-Y days average",
  "platforms": [
    {"name": "eBay", "price": "$XX-$XX", "best": true or false},
    {"name": "Poshmark", "price": "$XX-$XX", "best": false},
    {"name": "Facebook Marketplace", "price": "$XX-$XX", "best": false}
  ],
  "flipTip": "One specific actionable tip to maximize profit on this exact item (2 sentences max)"
}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: 'AI service error' }, { status: 500 });
    }

    const text = data.content.map((i) => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return Response.json(result);
  } catch (err) {
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
