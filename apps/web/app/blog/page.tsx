import Blog from '@/components/Blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Intelligence // Autonomous Insights',
  description: 'Access the latest AI-generated autonomous technology intelligence, synthesis, and deep dives.',
};

export default function BlogPage() {
  return (
    <>
      <h1 className="sr-only">Latest Autonomous Technology Intelligence & Editorial Deep Dives</h1>
      <Blog />
    </>
  );
}
