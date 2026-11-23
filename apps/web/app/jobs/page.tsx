import Jobs from '@/components/Jobs';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Units & Open Terminals',
  description: 'Explore live engineering, AI, and cybersecurity positions in cognitive computing.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JobsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <Jobs />
    </ProtectedRoute>
  );
}
