import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  logger.warn("⚠️ GEMINI_API_KEY is not set. AI features will fail or run in fallback mode.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

export const DEFAULT_MODEL = 'gemini-2.5-flash';
