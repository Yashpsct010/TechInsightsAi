import Register from '@/components/Register';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Node // Register',
  description: 'Initialize a new node identity on the TechInsights AI network to customize your intelligence feeds.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <Register />;
}
