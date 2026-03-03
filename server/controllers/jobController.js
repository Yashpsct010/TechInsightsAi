const axios = require("axios");
const pdfParse = require("pdf-parse");

/**
 * Executes a promise-returning function with exponential backoff retries.
 * @param {Function} fn - The function to execute.
 * @param {number} maxRetries - Maximum number of retries.
 * @param {number} baseDelayMs - Base delay in milliseconds.
 * @returns {Promise<any>}
 */
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
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Extracts raw text from a PDF buffer.
 */
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Parsing Exception:", error);
    throw new Error("Failed to parse PDF file. " + error.message);
  }
}

/**
 * Sends extracted resume text to Gemini to get a JSON array of top technical skills/roles.
 */
async function getSkillsFromGemini(resumeText) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not found.");
  }

  const prompt = `You are an expert technical recruiter and resume analyzer.
  Extract exactly the top 5 most important technical skills, roles, or job keywords from the following resume text.
  
  CRITICAL INSTRUCTIONS:
  1. Return ONLY a valid JSON array of strings. Do not include markdown blocks, explanations, or any other text.
  2. The items should be single terms or short phrases (e.g., "React", "Frontend Developer", "Machine Learning", "Python").
  3. If the resume is empty or lacks skills, return an empty array [].
  
  Resume Text:
  """
  ${resumeText.substring(0, 5000)} // Truncate to save tokens, usually first page has max info
  """`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1, // Low temp for more deterministic parsing
      maxOutputTokens: 150,
    },
  };

  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  const modelToUse = "gemini-2.5-flash-lite";

  const response = await withRetries(
    async () => {
      return await axios.post(
        `${baseUrl}/${modelToUse}:generateContent?key=${geminiApiKey}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        },
      );
    },
    2,
    1000,
  );

  const textResponse = response.data.candidates[0].content.parts[0].text;

  // Clean the response (in case Gemini still outputs markdown like ```json [...] ```)
  const cleanedText = textResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const skillsArray = JSON.parse(cleanedText);
    if (Array.isArray(skillsArray)) {
      return skillsArray.slice(0, 5); // Ensure max 5
    }
    throw new Error("Parsed result is not an array");
  } catch (err) {
    console.error(
      "Failed to parse Gemini output as JSON:",
      err,
      "Raw Output:",
      cleanedText,
    );
    throw new Error("Failed to extract skills from resume.");
  }
}

// Handler for the resume upload endpoint
exports.extractSkills = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported." });
    }

    console.log("Processing resume upload...");

    // Extract text
    const resumeText = await extractTextFromPDF(req.file.buffer);

    if (!resumeText || resumeText.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Could not extract enough text from the PDF." });
    }

    // Pass to Gemini
    const skills = await getSkillsFromGemini(resumeText);

    console.log("Successfully extracted skills:", skills);

    res.status(200).json({
      success: true,
      skills: skills,
    });
  } catch (error) {
    console.error("Extract Skills Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Handler for fetching jobs from Google Jobs via JSearch API
exports.searchJobs = async (req, res) => {
  try {
    const { query, page = 1, employment_types } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Using the provided key or environment variable
    const rapidApiKey =
      process.env.RAPIDAPI_KEY ||
      "83269ac3e2msh2954dabf39d0e4dp186d00jsn3f3249a2f36f";

    const options = {
      method: "GET",
      url: "https://jsearch.p.rapidapi.com/search",
      params: {
        query: query,
        page: page.toString(),
        num_pages: "1",
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    };

    // Add optional comma-separated employment types if provided (e.g. "FULLTIME,CONTRACTOR")
    if (employment_types) {
      options.params.target_employer_types = employment_types; // The APi usually uses employment_types for type but target_employer_types might exist
      // The API specifies 'employment_types' parameter for FULLTIME, CONTRACTOR, PARTTIME, INTERN
      options.params.employment_types = employment_types;
    }

    const response = await axios.request(options);

    // Send back the data extracted from the 'data' array of the response
    res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error(
      "Job Search API Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to fetch jobs from the live feed." });
  }
};
