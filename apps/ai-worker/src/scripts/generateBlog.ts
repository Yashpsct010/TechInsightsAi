import { generateBlog } from '../services/blogGenerator';
import { validateConfig } from '../config/env';
import { BlogGenre } from '@techinsights/database';

async function main() {
  validateConfig();

  const genreArg = process.argv.find((arg) => arg.startsWith('--genre='));
  const genre = genreArg ? (genreArg.split('=')[1] as BlogGenre) : null;

  console.log(`[Script] Launching manual blog generation (Genre: ${genre || 'auto'})...`);
  try {
    const blog = await generateBlog(genre);
    console.log(`[Script] ✅ Blog created: "${blog.title}" [ID: ${blog._id}]`);
    process.exit(0);
  } catch (error: any) {
    console.error('[Script] ❌ Blog generation failed:', error);
    process.exit(1);
  }
}

main();
