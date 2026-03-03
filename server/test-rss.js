const Parser = require("rss-parser");

const parser = new Parser({
  customFields: {
    item: ["description", "content:encoded", "pubDate"],
  },
});

async function fetchRecentNews(genre) {
  const feeds = {
    general: ["https://techcrunch.com/feed/"],
    "ai-ml": ["https://www.artificialintelligence-news.com/feed/"],
    cybersecurity: ["https://feeds.feedburner.com/TheHackersNews"],
    coding: ["https://dev.to/feed"],
    "emerging-tech": ["https://www.technologyreview.com/feed/"],
    "tech-news": ["https://techcrunch.com/feed/"],
  };

  const selectedFeeds = feeds[genre] || feeds["general"];
  let newsContext =
    "Here are some of the latest advancements and news articles from the last 48 hours to ground your blog post:\n\n";
  let hasNews = false;

  for (const feedUrl of selectedFeeds) {
    try {
      console.log(`Fetching RSS feed for context: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      const recentItems = feed.items.slice(0, 3);

      recentItems.forEach((item) => {
        hasNews = true;
        let summary = "No description available.";
        if (item.contentSnippet) {
          summary = item.contentSnippet.substring(0, 300) + "...";
        } else if (item.description) {
          summary = item.description.substring(0, 300) + "...";
        }

        newsContext += `- Title: ${item.title}\n`;
        newsContext += `  Summary: ${summary}\n\n`;
      });
    } catch (error) {
      console.warn(`Failed to fetch RSS feed ${feedUrl}:`, error.message);
    }
  }

  return hasNews ? newsContext : "";
}

async function run() {
  const genres = [
    "general",
    "ai-ml",
    "cybersecurity",
    "coding",
    "emerging-tech",
  ];
  for (const g of genres) {
    console.log(`\n=== Testing '${g}' ===`);
    const res = await fetchRecentNews(g);
    console.log(res ? "SUCCESS: Extracted news." : "FAILED: No news.");
  }
}

run();
