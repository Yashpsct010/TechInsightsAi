const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const axios = require("axios");

// Cache window in milliseconds
const CACHE_WINDOW_MS = 60 * 60 * 1000;

// Detect blog genre based on content
function detectBlogGenre(content) {
  const title = content.title.toLowerCase();
  const body = content.body.toLowerCase();

  const keywords = {
    "ai-ml": [
      "ai",
      "machine learning",
      "artificial intelligence",
      "neural network",
      "deep learning",
      "llm",
    ],
    cybersecurity: [
      "security",
      "cyber",
      "hack",
      "breach",
      "privacy",
      "encryption",
      "threat",
    ],
    coding: [
      "code",
      "programming",
      "developer",
      "software",
      "framework",
      "library",
      "github",
    ],
    "emerging-tech": [
      "blockchain",
      "web3",
      "metaverse",
      "vr",
      "ar",
      "quantum",
      "iot",
    ],
    "tech-news": [
      "announced",
      "released",
      "launched",
      "update",
      "version",
      "feature",
      "company",
    ],
  };

  // Count keyword occurrences for each genre
  const scores = {};
  for (const [genre, words] of Object.entries(keywords)) {
    scores[genre] = words.reduce((count, word) => {
      return (
        count + (title.includes(word) ? 2 : 0) + (body.includes(word) ? 1 : 0)
      );
    }, 0);
  }

  // Find genre with highest score
  let maxScore = 0;
  let detectedGenre = "general";
  for (const [genre, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedGenre = genre;
    }
  }

  return detectedGenre;
}

// Get latest blog for a given genre
exports.getLatestBlog = async (req, res) => {
  try {
    const requestedGenre = req.query.genre || null;
    const query = requestedGenre ? { genre: requestedGenre } : {};

    // Find the most recent blog for the given query
    const latestBlog = await Blog.findOne(query).sort({ createdAt: -1 }).exec();

    if (!latestBlog) {
      return res.status(404).json({ error: "No blog posts found." });
    }

    res.json({ blog: latestBlog });
    
  } catch (error) {
    console.error("Error getting latest blog:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches AI-generated blog content from the Gemini API.
 * @param {string | null} genre - The specific genre to request from the AI.
 * @returns {Promise<object>} The parsed JSON content from the AI response.
 */
async function getAiGeneratedContent(genre = null) {
  const geminiApiUrl = process.env.GEMINI_API_URL;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are a technology blog writer. Create a detailed and informative tech blog post about a current trending technology topic. 
        ${genre ? `Focus specifically on ${genre}. ` : ""}
        You are a cutting-edge technology blogger. Generate a comprehensive, informative, and engaging blog post covering the latest in technology. The content should be fresh, well-researched, and valuable for tech enthusiasts, developers, and industry professionals.

        Blog Focus Areas:
        Your article should include at least three of the following topics:

        - Tech Hacks & Coding Tricks - New shortcuts, tools, or techniques to boost productivity.
        - Latest Software & Feature Releases - Newly launched software, libraries, or updates from big tech companies.
        - AI & Machine Learning Advances - New AI models, research breakthroughs, and their real-world impact.
        - Emerging Technologies - Blockchain, Quantum Computing, Web3, AR/VR, etc.
        - Cybersecurity Trends - Latest security threats, best practices, or data privacy concerns.
        - Major Tech News - Big announcements from companies like Google, Microsoft, OpenAI, etc.
            
        The article should be comprehensive (around 800-1000 words) and include:
        
        1. An engaging title
        2. An introduction to the topic
        3. Key points and analysis
        4. Industry implications
        5. Future outlook
        6. A conclusion
        
        Also include:
        - 3-5 related resource links with titles and brief descriptions
        - A suggestion for an image that could accompany this article (describe it in detail)
        A detailed description of an image that could accompany this article, including specific search terms and resources (like a URL) where such an image could be found.
        
        Format your response as JSON with the following structure:
        {
          "title": "The blog post title",
          "body": "The full HTML formatted blog post content with proper h2, h3, p, ul, li tags, etc.",
          "image": "A link to a relevant royalty-free image or detailed description for an image to use",
          "imageAlt": "Alt text for the image",
          "imageCaption": "A brief caption for the image",
          "links": [
            {
              "title": "Resource title",
              "url": "Resource URL",
              "description": "Brief description of the resource",
              "image": "A link to a relevant royalty-free image or detailed description for an image to use",
              "imageAlt": "Alt text for the image",
              "imageCaption": "A brief caption for the image"
            }
          ]
        }
        
        Focus on providing valuable insights and accurate information about current technology trends.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const response = await axios.post(
    `${geminiApiUrl}?key=${geminiApiKey}`,
    requestBody,
    {
      headers: { "Content-Type": "application/json" },
      timeout: 25000,
    }
  );

  const textResponse = response.data.candidates[0].content.parts[0].text;
  console.log("Raw response received from Gemini API");

  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(
      "Failed to parse JSON from response:",
      textResponse.substring(0, 500) + "..."
    );
    throw new Error("Failed to parse content from API response");
  }

  try {
    const content = JSON.parse(jsonMatch[0]);
    console.log("Successfully parsed JSON content");
    return content;
  } catch (jsonError) {
    console.error(
      "JSON parsing error:",
      jsonError,
      "Raw match:",
      jsonMatch[0].substring(0, 500) + "..."
    );
    throw new Error("Failed to parse JSON content: " + jsonError.message);
  }
}

/**
 * Fetches an image URL for a blog post based on its title.
 * @param {string} title - The title of the blog post.
 * @returns {Promise<string>} The URL of the fetched image.
 */
async function getImageForBlog(title) {
  try {
    console.log("Attempting to fetch image from Unsplash...");
    const searchQuery = title.replace(/[^\w\s]/gi, "").split(" ").slice(0, 5).join(" ");

    const unsplashResponse = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchQuery
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
        timeout: 10000,
      }
    );

    if (
      unsplashResponse.data.results &&
      unsplashResponse.data.results.length > 0
    ) {
      console.log("Successfully fetched image from Unsplash");
      return unsplashResponse.data.results[0].urls.regular;
    } else {
      throw new Error("No image results found from Unsplash search.");
    }
  } catch (imageError) {
    console.warn(
      "Unsplash image search failed, using fallback:",
      imageError.message
    );
    const fallbackQuery = title.split(" ").slice(0, 3).join(" ");
    const fallbackUrl = `https://source.unsplash.com/random/1200x800/?${encodeURIComponent(
      fallbackQuery
    )}`;
    console.log(`Using fallback image URL: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

/**
 * Orchestrates the generation of a new blog post by fetching content and images,
 * then saving the final result to the database.
 * @param {string | null} genre - The specific genre to generate.
 * @returns {Promise<object>} The newly created blog document.
 */
async function generateNewBlog(genre = null) {
  try {
    // Step 1: Get AI-generated content
    const content = await getAiGeneratedContent(genre);

    // Step 2: Get an image for the blog
    const imageUrl = await getImageForBlog(content.title);

    // Step 3: Determine the genre if not explicitly provided
    const blogGenre = genre || detectBlogGenre(content);

    // Step 4: Create and save the new blog post
    const blog = new Blog({
      title: content.title,
      body: content.body,
      image: imageUrl,
      imageAlt: content.imageAlt || `Blog post image about ${content.title}`,
      imageCaption: content.imageCaption || "",
      genre: blogGenre,
      links: content.links || [],
    });

    console.log("Saving blog to database...");
    await blog.save();
    console.log("Blog saved successfully");
    return blog;
  } catch (error) {
    console.error("Failed to generate new blog:", error.message);
    // Re-throw the error to be caught by the calling function in generateBlog
    throw error;
  }
}

// Get all blogs with pagination and server-side filtering
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { genre, searchTerm, dateFilter } = req.query;

    // Build the query object based on request parameters
    const query = {};

    if (genre) {
      query.genre = genre;
    }

    if (searchTerm) {
      // Case-insensitive regex search on title and body
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { body: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === "year") {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Add date condition to the query
      query.createdAt = { $gte: filterDate };
    }

    // Execute queries to get blogs and total count
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error(`Error fetching blog with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Generate a new blog on demand (for cron job or admin)
exports.generateBlog = async (req, res) => {
  const startTime = Date.now();
  const genre = req.body.genre || null;
  const requestId = Math.random().toString(36).substring(2, 10);

  console.log(
    `[${requestId}] Blog generation started for genre: ${genre || "general"}`
  );

  try {
    // Send immediate response to prevent timeout
    res.status(202).json({
      success: true,
      message: "Blog generation started",
      requestId: requestId,
      genre: genre || "general",
    });

    // For Vercel serverless, we need to use a different approach than process.nextTick
    try {
      // Make sure we have a valid database connection
      const connectToDB = require("../utils/db");
      await connectToDB();

      // Check if we already have a recent blog of this genre (within 30 minutes)
      const existingBlog = await Blog.findOne(
        genre ? { genre: genre } : {}
      ).sort({ createdAt: -1 });

      const now = Date.now();
      const isRecent =
        existingBlog && now - existingBlog.createdAt.getTime() < 30 * 60 * 1000;

      if (isRecent) {
        console.log(
          `[${requestId}] Recent blog already exists for ${
            genre || "general"
          }, skipping generation`
        );
        return;
      }

      // Directly await blog generation rather than using process.nextTick
      const blog = await generateNewBlog(genre);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(
        `[${requestId}] Blog "${blog.title}" (${blog.genre}) saved to database in ${elapsed}s`
      );
    } catch (error) {
      console.error(
        `[${requestId}] Blog generation failed for ${genre || "general"}:`,
        error
      );
      console.error(`Stack trace: ${error.stack}`);
    }
  } catch (error) {
    console.error(`[${requestId}] Failed to start blog generation:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};
