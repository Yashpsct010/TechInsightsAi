import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['description', 'content:encoded', 'pubDate'],
  },
});

export const FEEDS: Record<string, string[]> = {
  general: [
    'https://medium.com/feed/tag/technology',
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://www.wired.com/feed/rss',
  ],
  'ai-ml': [
    'https://www.artificialintelligence-news.com/feed/',
    'https://venturebeat.com/category/ai/feed/',
    'https://news.mit.edu/rss/topic/artificial-intelligence2',
  ],
  cybersecurity: [
    'https://feeds.feedburner.com/TheHackersNews',
    'https://krebsonsecurity.com/feed/',
    'https://threatpost.com/feed/',
  ],
  coding: [
    'https://dev.to/feed',
    'https://www.freecodecamp.org/news/rss/',
    'https://stackoverflow.blog/feed/',
  ],
  'emerging-tech': [
    'https://www.technologyreview.com/feed/',
    'https://spectrum.ieee.org/rss/all',
    'https://arstechnica.com/feed/',
  ],
  'tech-news': [
    'https://medium.com/feed/tag/technology',
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://www.engadget.com/rss.xml',
  ],
};

export async function fetchRecentNews(genre: string | null = null): Promise<string> {
  const selectedFeeds = (genre && FEEDS[genre]) ? FEEDS[genre] : FEEDS.general;
  let newsContext =
    'Here are the LATEST REAL-WORLD news articles from the last 48 hours. USE THESE AS THE PRIMARY SOURCE FOR YOUR CONTENT AND LINKS:\n\n';
  let hasNews = false;

  for (const feedUrl of selectedFeeds) {
    try {
      console.log(`[RSS] Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      const recentItems = feed.items.slice(0, 3);

      recentItems.forEach((item) => {
        if (!item.title || !item.link) return;
        hasNews = true;
        let summary = 'No description available.';
        if (item.contentSnippet) {
          summary = item.contentSnippet.substring(0, 300) + '...';
        } else if (item.content) {
          summary = item.content.substring(0, 300) + '...';
        }

        newsContext += `ARTICLE_SOURCE:\n`;
        newsContext += `- Title: ${item.title}\n`;
        newsContext += `- URL: ${item.link}\n`;
        newsContext += `- Summary: ${summary}\n\n`;
      });
    } catch (error: any) {
      console.warn(`[RSS] Warning: Failed to fetch RSS feed ${feedUrl}:`, error.message);
    }
  }

  return hasNews ? newsContext : '';
}
