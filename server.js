const express = require('express');
const nodemailer = require('nodemailer');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
  h1 { font-size: 20px; font-weight: 500; margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
  h2 { font-size: 15px; font-weight: 500; margin: 28px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; }
  .pull-quote { background: #f5f0ff; border-left: 3px solid #7c3aed; padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 17px; font-style: italic; line-height: 1.6; margin: 8px 0 24px; }
  .testimonial { background: #f9f9f9; border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.7; }
  .qa-block { margin-bottom: 20px; }
  .question { font-size: 13px; font-weight: 500; color: #888; margin-bottom: 4px; }
  .answer { font-size: 15px; line-height: 1.6; }
  .divider { border: none; border-top: 1px solid #eee; margin: 32px 0; }
</style></head>
<body>
  <h1>New testimonial — ${name}, ${brand}</h1>
  <p class="meta">Submitted via AFM testimonial link</p>

  <h2>Suggested pull quote</h2>
  <div class="pull-quote">"${aiResult.pull_quote}"</div>

  <h2>Full testimonial (AI-crafted from their responses)</h2>
  <div class="testimonial">"${aiResult.full_testimonial}"<br><br>— ${name}, Founder, ${brand}</div>

  <hr class="divider">

  <h2>Raw responses</h2>
  ${answers.map((a, i) => `
    <div class="qa-block">
      <div class="question">Q${i + 1}: ${a.question}</div>
      <div class="answer">${a.answer}</div>
    </div>
  `).join('')}
</body>
</html>`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"AFM Testimonials" <${process.env.GMAIL_USER}>`,
      to: 'yvan@activatedfrequencymarketing.com',
      subject: `New testimonial — ${name}, ${brand}`,
      html: emailHtml
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AFM Testimonials running on port ${PORT}`));
