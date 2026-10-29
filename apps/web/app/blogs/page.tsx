import BlogsPage from '@/components/BlogsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Feed | Archive & Intelligence Feed | TechInsights AI',
  description: 'Search, filter, and access real-time AI autonomous technology articles, analysis, and research packets.',
};

export default function BlogsFeedPage() {
  return <BlogsPage />;
}
