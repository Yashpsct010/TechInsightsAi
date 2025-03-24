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

// Get latest blog (or generate a new one if cache expired)
exports.getLatestBlog = async (req, res) => {
  try {
    // Get requested genre (defaults to any)
    const requestedGenre = req.query.genre || null;

    // Define query based on genre
    const query = requestedGenre ? { genre: requestedGenre } : {};

    // Find most recent blog
    const latestBlog = await Blog.findOne(query).sort({ createdAt: -1 }).exec();

    const now = Date.now();

    // If we have a recent blog (within cache window), return it
    if (latestBlog && now - latestBlog.createdAt.getTime() < CACHE_WINDOW_MS) {
      return res.json({
        blog: latestBlog,
        fresh: false,
        nextRefresh: new Date(latestBlog.createdAt.getTime() + CACHE_WINDOW_MS),
      });
    }

    // Otherwise, we need to generate a new blog
    const newBlog = await generateNewBlog(requestedGenre);

    return res.json({
      blog: newBlog,
      fresh: true,
      nextRefresh: new Date(Date.now() + CACHE_WINDOW_MS),
    });
  } catch (error) {
    console.error("Error getting or generating blog:", error);
    res.status(500).json({ error: error.message });
  }
};

// Generate a new blog using APIs
async function generateNewBlog(genre = null) {
  try {
    // Build the Gemini API request
    const geminiApiUrl = process.env.GEMINI_API_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // IMPORTANT: Use the same prompt structure that worked in the frontend
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

    // Use the same request structure that worked in the frontend
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    };

    // Call the Gemini API
    const response = await axios.post(
      `${geminiApiUrl}?key=${geminiApiKey}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 25000, // 25 second timeout
      }
    );

    // Extract the blog content from response - ensure this matches the structure in geminiApi.js
    const textResponse = response.data.candidates[0].content.parts[0].text;
    console.log("Raw response received from Gemini API");

    // Extract JSON from text response
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

      // Generate image using Unsplash
      let imageUrl;
      try {
        console.log("Attempting to fetch image from Unsplash...");
        // Use Unsplash API to get an image
        const searchQuery = content.title
          .replace(/[^\w\s]/gi, "")
          .split(" ")
          .slice(0, 5)
          .join(" ");

        const unsplashResponse = await axios.get(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            searchQuery
          )}&per_page=1&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
            timeout: 10000, // 10 second timeout
          }
        );

        if (
          unsplashResponse.data.results &&
          unsplashResponse.data.results.length > 0
        ) {
          imageUrl = unsplashResponse.data.results[0].urls.regular;
          console.log("Successfully fetched image from Unsplash");
        } else {
          // Fallback to random tech image
          throw new Error("No image results found");
        }
      } catch (imageError) {
        console.warn(
          "Unsplash image search failed, using fallback:",
          imageError
        );
        // Fallback to unsplash random
        imageUrl = `https://source.unsplash.com/random/1200x800/?${encodeURIComponent(
          content.title.split(" ").slice(0, 3).join(" ")
        )}`;
        console.log("Using fallback image URL");
      }

      // Set the image URL
      content.image = imageUrl;

      // Detect the blog genre if not specified
      const blogGenre = genre || detectBlogGenre(content);

      // Create and save the new blog
      const blog = new Blog({
        title: content.title,
        body: content.body,
        image: content.image,
        imageAlt: content.imageAlt || "Blog post image about " + content.title,
        imageCaption: content.imageCaption || "",
        genre: blogGenre,
        links: content.links || [],
      });

      console.log("Saving blog to database...");
      await blog.save();
      console.log("Blog saved successfully");
      return blog;
    } catch (jsonError) {
      console.error(
        "JSON parsing error:",
        jsonError,
        "Raw match:",
        jsonMatch[0].substring(0, 500) + "..."
      );
      throw new Error("Failed to parse JSON content: " + jsonError.message);
    }
  } catch (error) {
    console.error("Failed to generate new blog:", error);
    throw error;
  }
}

// Get all blogs with pagination (for archive or admin)
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const genre = req.query.genre || null;

    const query = genre ? { genre } : {};

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
    res.status(500).json({ error: error.message });
  }
};

// Generate a new blog on demand (for cron job or admin)
exports.generateBlog = async (req, res) => {
  try {
    const genre = req.body.genre || null;
    const requestId = Math.random().toString(36).substring(2, 10);

    console.log(
      `[${requestId}] Blog generation started for genre: ${genre || "general"}`
    );

    // Send immediate response to prevent timeout
    res.status(202).json({
      success: true,
      message: "Blog generation started",
      requestId: requestId,
      genre: genre || "general",
    });

    // Use a more resilient approach for background processing
    process.nextTick(async () => {
      try {
        // Check if we already have a recent blog of this genre
        const existingBlog = await Blog.findOne(
          genre ? { genre: genre } : {}
        ).sort({ createdAt: -1 });

        const now = Date.now();
        const isRecent =
          existingBlog &&
          now - existingBlog.createdAt.getTime() < 60 * 60 * 1000; // 1 hour

        if (isRecent) {
          console.log(
            `[${requestId}] Recent blog already exists for ${
              genre || "general"
            }, skipping generation`
          );
          return;
        }

        const blog = await generateNewBlog(genre);
        console.log(
          `[${requestId}] Blog generated successfully: "${blog.title}" (${blog.genre})`
        );
      } catch (error) {
        console.error(
          `[${requestId}] Background blog generation failed for genre ${
            genre || "general"
          }:`,
          error.message
        );
      }
    });
  } catch (error) {
    console.error("Failed to start blog generation:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};
