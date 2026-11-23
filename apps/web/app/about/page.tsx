import About from '@/components/About';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Manifest // Architecture & Mission',
  description: 'Our mission to bridge deep technology insights, machine learning systems, and human comprehension.',
};

export default function AboutPage() {
  return <About />;
}
