import Jobs from '@/components/Jobs';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Future Roles & Engineering Units | TechInsights AI',
  description: 'Explore live engineering, AI, and cybersecurity positions in cognitive computing.',
};

export default function JobsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <Jobs />
    </ProtectedRoute>
  );
}
