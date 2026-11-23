import Bookmarks from '@/components/Bookmarks';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Bookmarks // Intelligence Vault',
  description: 'Manage and review your saved technical articles, architecture papers, and intelligence briefings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <Bookmarks />
    </ProtectedRoute>
  );
}
