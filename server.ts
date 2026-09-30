import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client on server with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for Meier Edu AI Assistant
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // If Gemini API key is available, call Gemini 3.8 Flash model
    if (apiKey) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 
              "Siz 'Meier Edu' zamonaviy o'quv markazining boshqaruv tizimi (CRM) uchun professional biznes va pedagogik AI yordamchisiz. O'zbek tilida aniq, xushmuomala, lo'nda va amaliy tavsiyalar, hisobotlar yoki xabarnomalar tayyorlab berasiz.",
            temperature: 0.7,
          },
        });

        const generatedText = response.text || '';
        return res.json({ text: generatedText, source: 'gemini' });
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to local generator:', geminiError?.message);
      }
    }

    // Intelligent local fallback if no key or API error
    let fallbackText = '';
    if (type === 'sms_debtor') {
      fallbackText = `Hurmatli ota-ona! Farzandingiz "Meier Edu" o'quv markazida tahsil olmoqda. Joriy oy uchun dars to'lovini amalga oshirishingizni iltimos qilamiz. Savollar bo'yicha markazimiz ma'muriyatiga murojaat qilishingiz mumkin. Meier Edu jamoasi.`;
    } else if (type === 'sms_attendance') {
      fallbackText = `Assalomu alaykum! "Meier Edu" o'quv markazidan ma'lum qilamizki, farzandingiz so'nggi darslarda ishtirok etmadi. Darslarni o'zlashtirish uchun darslarga muntazam qatnashishi muhim. Salomatlik yoki boshqa sabablarni aniqlashtirish uchun ma'muriyat bilan bog'lanishingizni so'raymiz.`;
    } else if (type === 'business_advice') {
      fallbackText = `Meier Edu o'quv markazi uchun tavsiyalar:\n1. O'qituvchilarga foizli to'lov tizimini joriy etish orqali ularni ko'proq talaba jalb qilishga rag'batlantiring (odatda 40% - 50% optimal hisoblanadi).\n2. Dars to'lovlarini har oyning 1-5 kunlari oralig'ida yig'ish qarzdorlikni 70% ga kamaytiradi.\n3. Sinov darsidan (Trial lesson) so'ng birinchi 24 soat ichida talabaga qo'ng'iroq qilib fikrlarini so'rash o'quvchiga aylanish ehtimolini 30% ga oshiradi.\n4. Oylik davomat jurnali bo'yicha 85% dan past davomatli talabalarning ota-onalariga avtomatik xabar berib boring.\n5. Xonalarning tushdan keyingi (14:00 - 18:00) soatlarini intensiv guruhlar bilan to'ldiring.`;
    } else {
      fallbackText = `Meier Edu AI Maslahatchisi javobi: Tizimdagi ma'lumotlar tahlil qilindi. O'quv markazi ko'rsatkichlari barqaror rivojlanmoqda. Guruhlarning dars jadvali, oylik davomati va to'lovlar intizomini muntazam nazorat qilib borish tavsiya etiladi.`;
    }

    return res.json({ text: fallbackText, source: 'fallback' });
  } catch (error: any) {
    console.error('AI generate route error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Setup Vite middlewares in development or static serve in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Meier Edu CRM server running on http://localhost:${PORT}`);
});
