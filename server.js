const express = require('express');
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function appendToSheet(data) {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const values = [
    [
      new Date().toISOString(),
      data.name,
      data.brand,
      data.pull_quote,
      data.full_testimonial,
      JSON.stringify(data.answers),
    ],
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:F',
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });
}

app.post('/api/submit', async (req, res) => {
  const { name, brand, answers } = req.body;

  if (!name || !brand || !answers || answers.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const rawTranscript = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join('\n\n');

    const prompt = `You are helping AFM (Activated Frequency Marketing), a boutique performance marketing agency, extract testimonial content from a client interview.

Here are the raw responses from ${name}, Founder of ${brand}:

${rawTranscript}

Your job:
1. Write the full testimonial as a single flowing paragraph in the client's own voice. Keep their language. Do not polish it into agency-speak. Make it sound like a real founder talking to another founder. 150–200 words max.
2. Extract the single strongest pull quote — one sentence that is the most concrete, specific, and emotionally resonant. It should name a real outcome or a real feeling, not a vague compliment.

Return ONLY valid JSON in this exact format, no preamble, no markdown:
{
  "full_testimonial": "...",
  "pull_quote": "..."
}`;

    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    let aiResult;
    try {
      const raw = aiResponse.content[0].text.replace(/```json|```/g, '').trim();
      aiResult = JSON.parse(raw);
    } catch {
      aiResult = {
        full_testimonial: 'Could not parse AI response. Raw answers preserved below.',
        pull_quote: 'See raw responses.'
      };
    }

    // Append to Google Sheet
    await appendToSheet({
      name,
      brand,
      pull_quote: aiResult.pull_quote,
      full_testimonial: aiResult.full_testimonial,
      answers
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AFM Testimonials running on port ${PORT}`));
