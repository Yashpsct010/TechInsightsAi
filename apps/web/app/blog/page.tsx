import Blog from '@/components/Blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Intelligence | TechInsights AI',
  description: 'Access the latest AI-generated autonomous technology intelligence, synthesis, and deep dives.',
};

export default function BlogPage() {
  return <Blog />;
}
