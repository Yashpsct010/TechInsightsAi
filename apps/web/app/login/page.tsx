import Login from '@/components/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Terminal | Login | TechInsights AI',
  description: 'Enter your credentials to authenticate and access your preferences and saved bookmarks.',
};

export default function LoginPage() {
  return <Login />;
}
