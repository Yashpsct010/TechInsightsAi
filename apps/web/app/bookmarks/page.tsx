import Bookmarks from '@/components/Bookmarks';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Bookmarks | TechInsights AI',
  description: 'Manage and review your saved technical articles, architecture papers, and intelligence briefings.',
};

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <Bookmarks />
    </ProtectedRoute>
  );
}
