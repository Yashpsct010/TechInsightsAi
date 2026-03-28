const Intel = require("../models/Intel");
const axios = require("axios");

// Reusable exponential backoff for Gemini API
async function withRetries(fn, maxRetries = 3, baseDelayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Intel Generation: Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Endpoint to generate a new "Daily Intel" bite using Gemini
 */
exports.generateIntel = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] Intel generation started.`);

  try {
    // For Vercel/serverless environments, ensure DB connects
    const connectToDB = require("../utils/db");
    await connectToDB();

    // Determine if we generated one in the last 12 hours (prevent spamming API on manual invokes)
    const existingIntel = await Intel.findOne().sort({ createdAt: -1 });
    const now = Date.now();
    const isRecent = existingIntel && (now - existingIntel.createdAt.getTime() < 12 * 60 * 60 * 1000);

    // If forcing generation via ?force=true, bypass the cooldown
    if (isRecent && req.query.force !== 'true') {
      console.log(`[${requestId}] Recent Intel already exists. Skipping.`);
      return res.status(200).json({
        success: true,
        message: "Recent intel already exists, skipped generation",
        intelId: existingIntel._id
      });
    }

    const topics = [
      "Obscure but incredibly useful websites",
      "Open-source alternatives to expensive software",
      "Terminal/Command Line productivity hacks",
      "Browser extensions that feel illegal to know",
      "Esoteric OS features or shortcuts",
      "Free tools for developers or designers"
    ];
    
    // Pick a random niche for today
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `You are an underground tech creator making a brutalist, cyberpunk-themed platform.
    Provide a mind-blowing, highly actionable hacking tip, a cool obscure website, or a bypass trick related to: "${selectedTopic}".
    Format your response purely as a JSON object, with no markdown code blocks wrapping it. Just the literal JSON.

    Format:
    {
      "intelHook": "Your extremely punchy 1-2 sentence hook. Make it sound like an insider secret.",
      "referenceUrl": "A REAL, verified URL related to your tip (must be a valid URL starting with https://). If no URL makes sense, leave it as an empty string."
    }

    CRITICAL RULES:
    1. Do not use pleasantries.
    2. Be brutal, concise, and highly useful.
    3. Output EXACTLY the JSON structure above. DO NOT wrap it in \`\`\`json blocks.
    4. The URL MUST BE REAL. Do not hallucinate a fake open source project.
    `;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8, // Slightly more creative for obscure hacks
        maxOutputTokens: 250,
      },
    };

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    const modelToUse = "gemini-2.5-flash-lite";

    const response = await withRetries(
      async () => {
        return await axios.post(
          `${baseUrl}/${modelToUse}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          requestBody,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
          }
        );
      },
      3,
      2000
    );

    let textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Sometimes the AI might still wrap in markdown despite being told not to
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let content;
    try {
      content = JSON.parse(textResponse);
    } catch (error) {
      console.error("Failed to parse Intel JSON:", error, textResponse);
      throw new Error("AI returned malformed JSON payload.");
    }

    const newIntel = new Intel({
      intelHook: content.intelHook,
      topic: selectedTopic,
      referenceUrl: content.referenceUrl || "",
    });

    await newIntel.save();
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[${requestId}] Intel saved to database in ${elapsed}s`);

    return res.status(200).json({
      success: true,
      message: "Intel generated successfully",
      intelId: newIntel._id,
      elapsed: `${elapsed}s`,
    });
  } catch (error) {
    console.error(`[${requestId}] Failed to generate Intel:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

/**
 * Fetch the exact Intel to display today.
 * If none is found, we fall back to a random default.
 */
exports.getTodayIntel = async (req, res) => {
  try {
    const latestIntel = await Intel.findOne().sort({ displayDate: -1, createdAt: -1 });

    if (latestIntel) {
      return res.json({ success: true, intel: latestIntel });
    }

    // Hardcoded fallback if the DB is completely empty
    return res.json({
      success: true, 
      intel: {
        intelHook: "CRITICAL ALERT: System intelligence is currently booting. No nodes active.",
        topic: "System Status",
        referenceUrl: ""
      }
    });
  } catch (error) {
    console.error("Error fetching today's Intel:", error);
    res.status(500).json({ error: "Failed to fetch Intel" });
  }
};
