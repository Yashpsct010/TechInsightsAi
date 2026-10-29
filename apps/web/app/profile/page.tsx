import Profile from '@/components/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile & Protocol Preferences | TechInsights AI',
  description: 'Manage your node identity, customize neural feed preferences, and access archived data packets.',
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
