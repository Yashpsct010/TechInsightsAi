// You'll need to get an API key from Google AI Studio (https://makersuite.google.com/)
// and add it to your .env file

import { searchImage } from "./unsplashApi";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = import.meta.env.VITE_GEMINI_API_URL;

export async function fetchBlogContent() {
  try {
    if (!API_KEY) {
      throw new Error(
        "API key is missing. Please add VITE_GEMINI_API_KEY to your .env file."
      );
    }

    const prompt = `You are a technology blog writer. Create a detailed and informative tech blog post about a current trending technology topic. 
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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    // Extract the JSON from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse content from API response");
    }

    const content = JSON.parse(jsonMatch[0]);

    // Generate an image using Unsplash based on the blog title and content
    try {
      const imagePrompt = `${content.title} - ${
        content.imageCaption || content.imageAlt || "technology blog"
      }`;
      content.image = await searchImage(imagePrompt);
      console.log("Successfully found image with Unsplash");
    } catch (imageError) {
      console.warn(
        "Failed to find image with Unsplash, using fallback:",
        imageError
      );
      // Fallback if Unsplash search fails
      content.image = `https://source.unsplash.com/random/1200x800/?${encodeURIComponent(
        content.title.split(" ").slice(0, 3).join(" ")
      )}`;
    }

    return content;
  } catch (error) {
    console.error("Error fetching content from Gemini API:", error);
    throw error;
  }
}
