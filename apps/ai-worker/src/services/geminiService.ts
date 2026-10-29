import axios from 'axios';
import { config } from '../config/env';
import { fetchRecentNews } from './rssService';

export interface GeneratedBlogContent {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  links: {
    title: string;
    url: string;
    description: string;
  }[];
}

export class SafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyError';
  }
}

/**
 * Reusable exponential backoff for Gemini calls
 */
async function withRetries<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 2000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Gemini] Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Gemini retries exceeded');
}

/**
 * Helper to extract balanced JSON object { ... }
 */
function extractBalancedJson(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let balance = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') balance++;
      else if (char === '}') {
        balance--;
        if (balance === 0) {
          return text.substring(start, i + 1);
        }
      }
    }
  }
  return null;
}

/**
 * Generates technical blog content via Gemini
 */
export async function getAiGeneratedBlog(
  genre: string | null = null,
  useFallback: boolean = false
): Promise<GeneratedBlogContent> {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in worker environment.');
  }

  const newsContext = useFallback ? '' : await fetchRecentNews(genre);

  let prompt = '';
  if (useFallback) {
    prompt = `You are an elite technology author writing for an underground, brutalist, high-tech intelligence publication.
Create a detailed, deep-dive tech blog post about current trending tech topics.
${genre ? `Focus specifically on ${genre}. ` : ''}

CRITICAL INSTRUCTION: Ensure the content is strictly informative, educational, and safe. Focus on real technological advancements.

Blog Focus Areas:
- Tech Architecture & Best Practices
- Latest Software & Feature Releases
- AI & Machine Learning Breakthroughs
- Emerging Technologies (Quantum, Distributed Systems, WebAssembly)
- Digital Security & Hardening Protocols

The article should be comprehensive (around 800-1000 words) and formatted with semantic HTML:
1. Title
2. Introduction with high-impact drop-cap opening paragraph
3. Deep architectural analysis with <h2> and <h3> subheadings
4. Code examples or technical lists with <code> and <ul>/<li>
5. Industry implications & future outlook
6. Conclusion

Format your response purely as JSON:
{
  "title": "The blog post title",
  "body": "The full HTML formatted blog post content with proper h2, h3, p, ul, li, pre, code tags.",
  "image": "detailed visual prompt describing a cyber-futuristic landscape or architecture",
  "imageAlt": "Alt text for the image",
  "imageCaption": "A brief caption for the image",
  "links": []
}`;
  } else {
    prompt = `You are an elite technology author writing for an underground, brutalist, high-tech intelligence publication.
Create a detailed, deep-dive tech blog post about current trending tech topics.
${genre ? `Focus specifically on ${genre}. ` : ''}

${
  newsContext
    ? `CRITICAL INSTRUCTION: USE THESE REAL NEWS SOURCES FOR YOUR BLOG.
MANDATORY: For the "links" section, ONLY USE THE URLs PROVIDED BELOW. DO NOT HALLUCINATE OR CREATE NEW URLs.

${newsContext}`
    : 'Provide real links to reputable tech sources like TechCrunch, Wired, The Verge, or Ars Technica.'
}

Blog Focus Areas:
- Tech Architecture & Best Practices
- Latest Software & Feature Releases
- AI & Machine Learning Breakthroughs
- Emerging Technologies (Quantum, Distributed Systems, WebAssembly)
- Digital Security & Hardening Protocols

The article should be comprehensive (around 800-1000 words) and formatted with semantic HTML:
1. Title
2. Introduction with high-impact opening paragraph
3. Deep architectural analysis with <h2> and <h3> subheadings
4. Code examples or technical lists with <code> and <ul>/<li>
5. Industry implications & future outlook
6. Conclusion

Format your response purely as JSON:
{
  "title": "The blog post title",
  "body": "The full HTML formatted blog post content with proper h2, h3, p, ul, li tags.",
  "image": "detailed description for an image",
  "imageAlt": "Alt text for the image",
  "imageCaption": "A brief caption for the image",
  "links": [
    {
      "title": "Resource title (from provided sources)",
      "url": "REAL_URL_FROM_PROVIDED_SOURCES",
      "description": "Brief description of why this resource is relevant"
    }
  ]
}`;
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  const modelToUse = 'gemini-3.1-flash-lite';

  const response = await withRetries(
    async () => {
      return await axios.post(
        `${baseUrl}/${modelToUse}:generateContent?key=${config.geminiApiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Referer: config.clientUrl || 'http://localhost:3000',
          },
          timeout: 45000,
        }
      );
    },
    3,
    2000
  );

  const candidate = response.data?.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new SafetyError('Gemini returned no content or blocked generation.');
  }

  const rawText = candidate.content.parts[0].text;
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const balanced = extractBalancedJson(rawText);
    if (balanced) {
      return JSON.parse(balanced);
    }
    throw new Error('Failed to parse JSON response from Gemini');
  }
}

/**
 * Generates Daily Tech Intel bite
 */
export async function getAiGeneratedIntel(): Promise<{ intelHook: string; referenceUrl: string; topic: string }> {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in worker environment.');
  }

  const topics = [
    'Obscure but incredibly useful developer tools',
    'Open-source alternatives to expensive enterprise software',
    'Terminal and command line productivity secrets',
    'Browser extensions that feel illegal to know',
    'Esoteric kernel and OS features or shortcuts',
    'Free high-leverage tools for system architects',
  ];

  const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

  const prompt = `You are an underground tech creator for a brutalist, cyberpunk-themed intelligence platform.
Provide a mind-blowing, highly actionable hacking tip, a cool obscure website, or a bypass trick related to: "${selectedTopic}".
Format your response purely as a JSON object, with no markdown code blocks.

Format:
{
  "intelHook": "Your extremely punchy 1-2 sentence hook. Make it sound like an insider secret.",
  "referenceUrl": "A REAL, verified URL related to your tip (must start with https://). If none, leave empty string."
}

CRITICAL RULES:
1. Do not use pleasantries.
2. Be brutal, concise, and highly useful.
3. The URL MUST BE REAL.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 300,
      responseMimeType: 'application/json',
    },
  };

  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  const modelToUse = 'gemini-3.1-flash-lite';

  const response = await withRetries(
    async () => {
      return await axios.post(
        `${baseUrl}/${modelToUse}:generateContent?key=${config.geminiApiKey}`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );
    },
    2,
    1500
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  let parsed: any = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const balanced = extractBalancedJson(text);
    if (balanced) parsed = JSON.parse(balanced);
  }

  return {
    intelHook: parsed.intelHook || 'Use strace -p <PID> -s 9999 to inspect any live process network buffers instantly.',
    referenceUrl: parsed.referenceUrl || 'https://man7.org/linux/man-pages/man1/strace.1.html',
    topic: selectedTopic,
  };
}
