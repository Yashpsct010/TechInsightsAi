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

    const prompt = `You are a cutting-edge technology blogger. Generate a comprehensive, informative, and engaging tech blog post covering the latest trends in technology. 

Blog Structure & Requirements:  
Ensure the article follows this exact structure with HTML tags for proper formatting:

1. Title (h1)  
   - The title should be engaging, SEO-friendly, and under 70 characters.  

2. Introduction (h2)  
   - Hook the reader in 2-3 sentences.  
   - Explain why this topic is important today.  

3. Key Points & Analysis (h2)  
   - Cover at least three of the following areas:  
     - Tech Hacks & Coding Tricks (New shortcuts, tools, or techniques)  
     - Latest Software & Feature Releases (New updates, frameworks, tools)  
     - AI & Machine Learning Advances (Research breakthroughs, real-world impact)  
     - Emerging Technologies (Blockchain, Quantum Computing, Web3, AR/VR)  
     - Cybersecurity Trends (Threats, best practices, data privacy concerns)  
     - Major Tech News (Announcements from Google, Microsoft, OpenAI, etc.)  

4. Industry Implications (h2)  
   - How does this affect developers, businesses, and end-users?  
   - Include real-world examples (e.g., Google, OpenAI, Meta innovations).  

5. Future Outlook (h2)  
   - Predict where this technology is heading.  
   - Mention potential risks and benefits.  

6. Conclusion (h2)  
   - Summarize key takeaways.  
   - Include a call to action (e.g., “What are your thoughts on this? Comment below!”).  

Image Requirements:  
- Suggest one featured image with a detailed description.  
- Provide alt text and a caption for accessibility.  

External Resources (3-5 links):  
- Title: Short and clear.  
- URL: Valid and relevant.  
- Description: Brief explanation of why it is useful.  

Final Checklist:  
- Title under 70 characters.  
- Follows HTML structure with h2, h3, p, ul, li tags.  
- Includes at least three key tech topics.  
- Includes one image suggestion.  
- Includes three to five external links.  
`;

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
