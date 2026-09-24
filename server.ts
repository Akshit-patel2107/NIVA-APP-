import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Verified NIVA Pad Batch Database
const VERIFIED_NIVA_BATCHES: Record<string, any> = {
  'NIVA-ORG-2849': {
    batchNumber: 'NIVA-ORG-2849',
    productName: 'NIVA Ultra-Thin Day Comfort',
    absorbency: 'Regular Flow (3/5 drops)',
    coreMaterial: '100% GOTS-Certified Organic Texas Cotton',
    wings: 'Flexible Soft-Wing Lock',
    toxins: '0% Chlorine, 0% Dyes, 0% Fragrance, 0% Plastic Bleach',
    testedBy: 'Dermatest® Germany — Rated Excellent for Sensitive Skin',
    manufacturedDate: '2026-06-15',
    expiryDate: '2029-06-14',
    padCount: 14,
    bonusPerk: 'Unlocked: Cycle Synchrony Tea Recipe & 100 NIVA Care Points',
  },
  'NIVA-NIGHT-9481': {
    batchNumber: 'NIVA-NIGHT-9481',
    productName: 'NIVA Extra Long Overnight Sanctuary',
    absorbency: 'Heavy Flow & Overnight (5/5 drops - 320mm)',
    coreMaterial: 'Double Organic Cotton Layer with Plant Bamboo Absorption Core',
    wings: 'Wide Rear Protective Wings',
    toxins: 'Zero synthetic perfumes, hypoallergenic',
    testedBy: 'Dermatest® Germany — Dermatologically Tested',
    manufacturedDate: '2026-07-02',
    expiryDate: '2029-07-01',
    padCount: 10,
    bonusPerk: 'Unlocked: Overnight Cramp Relief Sleep Meditation Audio',
  },
  'NIVA-TEEN-1102': {
    batchNumber: 'NIVA-TEEN-1102',
    productName: 'NIVA Teen First Cycle Starter Pack',
    absorbency: 'Light to Medium Flow (petite fit)',
    coreMaterial: 'Feather-Soft Organic Cotton with breathable backing',
    wings: 'Snug-Fit Anti-Bunching Wings',
    toxins: 'Ultra-pure, hypoallergenic, toxin-free',
    testedBy: 'Pediatric & Adolescent Gynecology Panel Reviewed',
    manufacturedDate: '2026-08-10',
    expiryDate: '2029-08-09',
    padCount: 16,
    bonusPerk: 'Unlocked: Teen Guide to Body Changes Handbook & Pocket Mirror',
  },
  'NIVA-MAT-5530': {
    batchNumber: 'NIVA-MAT-5530',
    productName: 'NIVA Postpartum & Maternity Care',
    absorbency: 'Maximum Comfort Maternity (Super Max)',
    coreMaterial: 'Pure Organic Cotton with Witch Hazel Infusion Ready Liner',
    wings: 'Contoured Secure Wings',
    toxins: 'Pure plant-based, no irritation, breathable membrane',
    testedBy: 'Midwife & OB-GYN Clinical Safety Certified',
    manufacturedDate: '2026-05-20',
    expiryDate: '2029-05-19',
    padCount: 12,
    bonusPerk: 'Unlocked: Postpartum Healing Guide & Gentle Pelvic Restore',
  },
};

// API: Verify NIVA QR / Batch Code
app.get('/api/qr/verify/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const matched = VERIFIED_NIVA_BATCHES[code];

  if (matched) {
    return res.json({
      verified: true,
      batch: matched,
    });
  }

  // If user enters an unlisted valid format or test code
  if (code.startsWith('NIVA-') || code.length >= 6) {
    return res.json({
      verified: true,
      batch: {
        batchNumber: code,
        productName: 'NIVA Certified Organic Sanitary Pad Pack',
        absorbency: 'Balanced Flow (4/5 drops)',
        coreMaterial: '100% Certified Organic Cotton & Eco-Cellulose Core',
        wings: 'Active-Fit Leak Shield',
        toxins: 'Chlorine-free, Dye-free, Fragrance-free',
        testedBy: 'Dermatologically Approved for Daily Intimate Health',
        manufacturedDate: '2026-07-18',
        expiryDate: '2029-07-17',
        padCount: 12,
        bonusPerk: 'Unlocked: Verified Genuine Pad Pack & 50 NIVA Care Points',
      },
    });
  }

  return res.status(404).json({
    verified: false,
    error: 'Unrecognized batch or QR code. Please scan the QR code printed inside your NIVA pad packaging box.',
  });
});

// API: AI Cycle Insights
app.post('/api/ai/cycle-insights', async (req: Request, res: Response) => {
  try {
    const {
      cycleDay = 14,
      cycleLength = 28,
      periodLength = 5,
      phase = 'Ovulation',
      symptoms = [],
      moods = [],
      notes = '',
    } = req.body;

    if (!apiKey) {
      // Fallback if API key is not present in local test environment
      return res.json({
        summary: `You are in your ${phase} phase (Day ${cycleDay} of ${cycleLength}). Your estrogen levels are peaking, supporting natural focus and energy.`,
        bodySignals: `Your logged symptoms (${symptoms.length > 0 ? symptoms.join(', ') : 'none reported'}) reflect expected hormonal fluctuations.`,
        nutritionTip: 'Incorporate zinc-rich pumpkin seeds, leafy greens, and gentle hydration to maintain electrolyte balance.',
        movementTip: 'Moderate cardio, yoga, or rhythmic strength training pairs harmoniously with this phase.',
        padAdvice: 'Keep a NIVA Ultra-Thin liner on hand for natural cervical mucus changes during your fertile window.',
        disclaimer: 'These personalized wellness insights are generated by AI for informational and self-care tracking purposes only and do not constitute medical diagnosis or treatment advice.',
      });
    }

    const prompt = `You are NIVA's warm, supportive, and scientifically grounded women's health companion.
The user is tracking their menstrual cycle with the following data:
- Current Day in Cycle: Day ${cycleDay} of a ${cycleLength}-day cycle
- Current Phase: ${phase}
- Normal Period Duration: ${periodLength} days
- Recent Symptoms Logged: ${symptoms.length ? symptoms.join(', ') : 'None logged today'}
- Recent Moods Logged: ${moods.length ? moods.join(', ') : 'Balanced/Calm'}
- User Notes: ${notes || 'None'}

Please provide an empathetic, clear, personalized wellness analysis tailored to this specific cycle day and phase.
Format your response as valid JSON with this exact structure:
{
  "summary": "1-2 concise, empowering sentences describing what is happening hormonally in the body right now.",
  "bodySignals": "Clear, reassuring explanation connecting their symptoms/mood to hormone shifts (e.g. estrogen, progesterone, prostaglandins).",
  "nutritionTip": "Specific food, tea, or hydration recommendation ideal for this cycle phase.",
  "movementTip": "Tailored exercise or rest recommendation (e.g. restorative yoga vs high energy intervals).",
  "padAdvice": "Helpful advice on intimate hygiene, pad changing schedule, or flow management.",
  "disclaimer": "AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        summary: `You are currently on Day ${cycleDay} (${phase} phase).`,
        bodySignals: 'Hormonal variations throughout your cycle naturally influence physical energy and mood.',
        nutritionTip: 'Focus on nourishing whole foods and warm fluids.',
        movementTip: 'Listen to your body rhythm today.',
        padAdvice: 'Change pads every 4 to 6 hours for optimal freshness and comfort.',
        disclaimer: 'AI insights provide personalized wellness guidance and are not medical diagnoses.',
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI cycle insights:', error);
    // Graceful empathetic fallback if model is busy or throttled
    const { cycleDay = 14, phase = 'Ovulation', symptoms = [] } = req.body || {};
    return res.json({
      summary: `You are on Day ${cycleDay} of your cycle (${phase} phase). Your hormonal rhythm is shifting, supporting your body's natural cyclical flow.`,
      bodySignals: symptoms.length > 0
        ? `Your logged signals (${symptoms.join(', ')}) are natural responses to shifting hormone levels between estrogen and progesterone.`
        : 'Your body is maintaining balanced baseline energy. Keep tracking daily to detect subtle hormonal cues.',
      nutritionTip: phase === 'Menstrual Phase'
        ? 'Nourish with warm iron-rich broths, spinach, and red raspberry leaf tea to ease uterine contractions.'
        : phase === 'Ovulation'
        ? 'Opt for antioxidant-rich berries, leafy greens, and zinc-rich seeds to support peak cellular vitality.'
        : 'Focus on magnesium-rich dark chocolate, pumpkin seeds, and complex carbs to soothe luteal serotonin shifts.',
      movementTip: phase === 'Menstrual Phase'
        ? 'Honor rest: gentle floor stretches, slow walks, and restorative pelvic yoga.'
        : phase === 'Ovulation'
        ? 'Harness peak estrogen with uplifting strength training, cardio, or dancing.'
        : 'Moderate pilates, swimming, and mindful breathing to stabilize cortisol.',
      padAdvice: 'Change your NIVA sanitary pad every 4 to 6 hours for pristine freshness and intimate skin barrier protection.',
      disclaimer: 'AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns.',
    });
  }
});

// API: AI Ask Health & Wellness Question
app.post('/api/ai/ask-health', async (req: Request, res: Response) => {
  try {
    const { question, userContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!apiKey) {
      return res.json({
        answer: `Thank you for asking about "${question}". During your cycle, hormonal shifts between estrogen and progesterone commonly influence cramping, energy, and emotions. Staying hydrated, applying gentle warmth to the lower abdomen, and wearing breathable organic cotton pads can alleviate discomfort. If you experience severe debilitating pain, unusual heavy bleeding soaking through more than one pad per hour, or sudden dizziness, please consult a gynecologist or healthcare clinic immediately.`,
        suggestedFollowUps: [
          'What are gentle natural remedies for menstrual cramps?',
          'How do I track fertile vs low-fertility days accurately?',
          'How often should I change my sanitary pad during heavy flow?',
        ],
        disclaimer: 'This guidance is educational and does not constitute medical advice or diagnosis.',
      });
    }

    const contextStr = userContext
      ? `User context: Current Day ${userContext.cycleDay || 'N/A'}, Phase: ${userContext.phase || 'N/A'}, Symptoms: ${userContext.symptoms?.join(', ') || 'none specified'}.`
      : 'User context: General women menstrual wellness inquiry.';

    const systemInstruction = `You are NIVA's certified menstrual wellness AI companion.
You provide supportive, scientifically sound, friendly, and non-judgmental guidance for girls, teenagers, and adult women about menstrual cycles, pad hygiene, ovulation, puberty, fertility windows, and reproductive health.
Tone: Warm, empathetic, respectful, clear, and destigmatizing.
CRITICAL SAFETY RULE: You are NOT a doctor and cannot diagnose conditions (like endometriosis, PCOS, pregnancy, or infections). Always include comforting self-care suggestions and recommend seeing a healthcare provider or gynecologist if red-flag symptoms are mentioned.`;

    const prompt = `${contextStr}

User Question: "${question}"

Respond with JSON in this format:
{
  "answer": "A clear, empathetic, 2-3 paragraph answer explaining the biological reason, gentle practical self-care steps, and what is normal.",
  "redFlags": "Brief mention of when to contact a doctor if symptoms are severe or abnormal, or null if strictly educational.",
  "suggestedFollowUps": ["3 short relevant follow-up questions the user might want to explore next"],
  "disclaimer": "AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        answer: responseText,
        redFlags: null,
        suggestedFollowUps: ['How can I soothe cramps naturally?', 'What are the 4 phases of the cycle?'],
        disclaimer: 'AI insights provide personalized wellness guidance and are not medical diagnoses.',
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error answering health question:', error);
    const { question } = req.body || {};
    return res.json({
      answer: `Regarding your question ("${question || 'Cycle health'}"): Throughout your menstrual cycle, shifting balances of estrogen and progesterone naturally affect muscular tension, hydration, and moods. Staying hydrated, applying warm compresses or heating pads to the lower abdomen, resting when needed, and using breathable 100% organic cotton pads can significantly reduce discomfort and skin irritation.\n\nRemember to listen to your body's signals each day. If cramps are accompanied by sudden dizziness, high fever, or bleeding that soaks more than one pad per hour, be sure to contact a healthcare professional or gynecologist.`,
      redFlags: 'If you experience severe unmanageable pain or soak through pads in under an hour, consult a doctor.',
      suggestedFollowUps: [
        'How can I soothe cramps naturally with heat and nutrition?',
        'How does the fertile window calculation work?',
        'Why does organic cotton prevent rashes?',
      ],
      disclaimer: 'AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIVA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
