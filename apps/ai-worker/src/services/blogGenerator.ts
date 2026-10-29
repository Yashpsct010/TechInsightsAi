import { connectToDatabase, Blog, BlogGenre } from '@techinsights/database';
import { getAiGeneratedBlog, GeneratedBlogContent } from './geminiService';
import { getImageForBlog } from './imageService';

function detectBlogGenre(content: { title: string; body: string }): BlogGenre {
  const title = content.title.toLowerCase();
  const body = content.body.toLowerCase();

  const keywords: Record<BlogGenre, string[]> = {
    'ai-ml': ['ai', 'machine learning', 'artificial intelligence', 'neural network', 'deep learning', 'llm'],
    cybersecurity: ['security', 'cyber', 'hack', 'breach', 'privacy', 'encryption', 'threat', 'vulnerability'],
    coding: ['code', 'programming', 'developer', 'software', 'framework', 'library', 'github', 'typescript', 'rust'],
    'emerging-tech': ['blockchain', 'web3', 'metaverse', 'vr', 'ar', 'quantum', 'iot', 'robotics'],
    'tech-news': ['announced', 'released', 'launched', 'update', 'version', 'feature', 'acquisition'],
    general: ['tech', 'technology', 'system', 'digital', 'data'],
  };

  const scores: Record<string, number> = {};
  for (const [genre, words] of Object.entries(keywords)) {
    scores[genre] = words.reduce((count, word) => {
      return count + (title.includes(word) ? 2 : 0) + (body.includes(word) ? 1 : 0);
    }, 0);
  }

  let maxScore = 0;
  let detectedGenre: BlogGenre = 'general';
  for (const [genre, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedGenre = genre as BlogGenre;
    }
  }

  return detectedGenre;
}

export async function generateBlog(genre: BlogGenre | null = null) {
  await connectToDatabase();
  console.log(`[BlogGenerator] Starting blog generation for genre: ${genre || 'auto-detect'}...`);

  let content: GeneratedBlogContent;
  try {
    content = await getAiGeneratedBlog(genre, false);
  } catch (error: any) {
    console.warn(`[BlogGenerator] Grounded generation failed: ${error.message}. Retrying with context-free fallback...`);
    content = await getAiGeneratedBlog(genre, true);
  }

  console.log(`[BlogGenerator] Generated title: "${content.title}". Fetching cover image...`);
  const imageUrl = await getImageForBlog(content.title);

  const finalGenre = genre || detectBlogGenre(content);

  const blog = new Blog({
    title: content.title,
    body: content.body,
    image: imageUrl,
    imageAlt: content.imageAlt || `Technical analysis covering ${content.title}`,
    imageCaption: content.imageCaption || '',
    genre: finalGenre,
    links: content.links || [],
  });

  await blog.save();
  console.log(`[BlogGenerator] ✅ Successfully saved new blog [ID: ${blog._id}] to database!`);
  return blog;
}
