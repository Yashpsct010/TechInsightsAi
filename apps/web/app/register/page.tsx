import Register from '@/components/Register';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Node | Register | TechInsights AI',
  description: 'Initialize a new node identity on the TechInsights AI network to customize your intelligence feeds.',
};

export default function RegisterPage() {
  return <Register />;
}
