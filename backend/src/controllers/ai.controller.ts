import { Request, Response } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Provider from '../models/Provider';
import Review from '../models/Review';
import Service from '../models/Service';
import { sendSuccess, sendError } from '../utils/helpers';
import env from '../config/env';

// ── Initialise Gemini ─────────────────────────────────────────────────────────
const getGeminiClient = () => {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
};

const getModel = () => {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generationConfig: {
      temperature:     0.7,
      topP:            0.95,
      maxOutputTokens: 1024,
    },
  });
};

// ── System context for the marketplace chatbot ────────────────────────────────
const SYSTEM_CONTEXT = `You are a helpful assistant for Smart Service Marketplace — an Indian platform that connects customers with verified local service providers (plumbers, electricians, cleaners, tutors, fitness trainers, beauty professionals, appliance repair technicians, and movers).

Your role:
- Help users find the right services and providers
- Answer questions about bookings, payments, and the platform
- Suggest relevant services based on user needs
- Be concise, friendly, and professional
- Always respond in the same language the user writes in (Hindi or English)
- Prices are in Indian Rupees (₹)

If asked about something outside the platform scope, politely redirect to relevant services.`;

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string') {
      sendError(res, 'message is required.', 400); return;
    }

    const model = getModel();

    // Build conversation history in Gemini format
    const formattedHistory = (history as Array<{ role: string; content: string }>).map((h) => ({
      role:  h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user',  parts: [{ text: SYSTEM_CONTEXT }] },
        { role: 'model', parts: [{ text: 'Understood! I am ready to help customers on Smart Service Marketplace.' }] },
        ...formattedHistory,
      ],
    });

    const contextNote = context ? `\n\n[Context: ${context}]` : '';
    const result = await chat.sendMessage(message + contextNote);
    const reply  = result.response.text();

    sendSuccess(res, { reply, message }, 'Chat response generated.');
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('GEMINI_API_KEY')) {
      sendError(res, 'AI service is not configured.', 503); return;
    }
    sendError(res, 'AI chat failed. Please try again.', 500);
  }
};

// ── Natural Language Search ───────────────────────────────────────────────────
export const naturalLanguageSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query) { sendError(res, 'query is required.', 400); return; }

    const model = getModel();

    const prompt = `You are a search query parser for a home services marketplace in India.

User search query: "${query}"

Extract the following as JSON (no markdown, no explanation, raw JSON only):
{
  "category": "one of: plumbing, electrical, cleaning, tutoring, fitness, beauty, appliance-repair, moving, or null",
  "keywords": ["array", "of", "keywords"],
  "isEmergency": true or false,
  "maxBudget": number in rupees or null,
  "minBudget": number in rupees or null,
  "city": "city name or null",
  "intent": "one sentence describing what the user needs"
}`;

    const result   = await model.generateContent(prompt);
    const text     = result.response.text().trim();
    const cleaned  = text.replace(/```json|```/g, '').trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { keywords: [query], intent: query };
    }

    // Now query the DB using extracted params
    const filter: Record<string, unknown> = { isActive: true };
    if (parsed.category) {
      const Category = require('../models/Category').default;
      const cat = await Category.findOne({ slug: parsed.category });
      if (cat) filter.category = cat._id;
    }
    if (parsed.isEmergency) filter.isEmergencyAvailable = true;
    if (parsed.maxBudget || parsed.minBudget) {
      filter['pricing.amount'] = {
        ...(parsed.minBudget ? { $gte: parsed.minBudget } : {}),
        ...(parsed.maxBudget ? { $lte: parsed.maxBudget } : {}),
      };
    }
    if ((parsed.keywords as string[])?.length) {
      filter.$text = { $search: (parsed.keywords as string[]).join(' ') };
    }

    const services = await Service.find(filter)
      .populate('provider', 'businessName rating coverImage location')
      .populate('category', 'name icon')
      .limit(10);

    sendSuccess(res, { parsedQuery: parsed, results: services }, 'Search complete.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Recommend Providers ───────────────────────────────────────────────────────
export const recommendProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { preferences, location, previousBookings = [] } = req.body;

    const topProviders = await Provider.find({ isApproved: true })
      .populate('category', 'name')
      .sort('-rating.average -completedJobs')
      .limit(20);

    if (!topProviders.length) {
      sendSuccess(res, [], 'No providers to recommend yet.'); return;
    }

    const model = getModel();

    const providerSummary = topProviders.slice(0, 10).map((p) => ({
      id:           String(p._id),
      businessName: p.businessName,
      rating:       p.rating.average,
      jobs:         p.completedJobs,
      emergency:    p.isEmergencyAvailable,
      city:         p.location.city,
    }));

    const prompt = `You are a recommendation engine for a home services marketplace.

User preferences: ${preferences || 'Not specified'}
User location: ${location?.city || 'Not specified'}
Past bookings: ${(previousBookings as string[]).join(', ') || 'None'}

Available providers (JSON):
${JSON.stringify(providerSummary, null, 2)}

Return a JSON array of up to 5 provider IDs in order of recommendation, with a short reason for each.
Format (raw JSON only, no markdown):
[
  { "id": "provider_id", "reason": "Short reason" }
]`;

    const result  = await model.generateContent(prompt);
    const text    = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();

    let recommendations: Array<{ id: string; reason: string }> = [];
    try {
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = providerSummary.slice(0, 5).map((p) => ({
        id:     p.id,
        reason: `Top rated provider with ${p.rating} stars`,
      }));
    }

    // Fetch full provider data
    const providerIds = recommendations.map((r) => r.id);
    const providers   = await Provider.find({ _id: { $in: providerIds } })
      .populate('category', 'name icon');

    const enriched = recommendations.map((rec) => ({
      ...rec,
      provider: providers.find((p) => String(p._id) === rec.id),
    })).filter((r) => r.provider);

    sendSuccess(res, enriched, 'Recommendations generated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Summarise Reviews ─────────────────────────────────────────────────────────
export const summarizeReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.body;
    if (!providerId) { sendError(res, 'providerId is required.', 400); return; }

    const reviews = await Review.find({ provider: providerId, isVisible: true })
      .select('rating comment tags subRatings')
      .sort('-createdAt')
      .limit(50);

    if (reviews.length < 3) {
      sendSuccess(res, { summary: 'Not enough reviews yet to generate a summary.', reviewCount: reviews.length }, 'OK');
      return;
    }

    const reviewTexts = reviews.map((r) =>
      `Rating: ${r.rating}/5 — "${r.comment}"`
    ).join('\n');

    const model = getModel();

    const prompt = `You are an AI that summarises customer reviews for service providers on a marketplace.

Reviews (most recent first):
${reviewTexts}

Write a 2-sentence summary that:
1. Highlights what customers love most
2. Mentions any common concerns or patterns

Be specific, honest, and use natural language. Do not use bullet points. Keep it under 60 words.`;

    const result  = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Cache summary on provider
    await Provider.findByIdAndUpdate(providerId, { 'aiSummary': summary });

    sendSuccess(res, {
      summary,
      reviewCount:  reviews.length,
      avgRating:    reviews.reduce((a, r) => a + r.rating, 0) / reviews.length,
    }, 'Summary generated.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};

// ── Analyse Image (detect service type) ──────────────────────────────────────
export const analyzeImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) { sendError(res, 'No image uploaded.', 400); return; }

    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = {
      inlineData: {
        data:     file.buffer.toString('base64'),
        mimeType: file.mimetype,
      },
    };

    const prompt = `You are a home service diagnostic AI. Analyse this image of a home problem.

Return JSON only (no markdown):
{
  "serviceType": "one of: plumbing, electrical, cleaning, appliance-repair, carpentry, painting, or other",
  "problemDescription": "brief description of the issue",
  "urgency": "low, medium, or high",
  "estimatedCost": { "min": number, "max": number },
  "recommendation": "one sentence advice"
}

All costs in Indian Rupees.`;

    const result  = await model.generateContent([prompt, imagePart]);
    const text    = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        serviceType:         'other',
        problemDescription:  'Could not analyse image automatically',
        urgency:             'medium',
        estimatedCost:       { min: 500, max: 2000 },
        recommendation:      'Please describe the issue in text for better assistance.',
      };
    }

    sendSuccess(res, analysis, 'Image analysed.');
  } catch (err) { sendError(res, (err as Error).message, 500); }
};
