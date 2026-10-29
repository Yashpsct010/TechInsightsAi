import BlogDetailPage from '@/components/BlogDetailPage';
import type { Metadata, ResolvingMetadata } from 'next';
import { connectToDatabase, Blog } from '@techinsights/database';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    await connectToDatabase();
    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return {
        title: 'Data Node Details | TechInsights AI',
        description: 'Deep dive technical intelligence analysis and verified engineering nodes.',
      };
    }

    const title = `${blog.title} | TechInsights AI`;
    const snippet = blog.body ? blog.body.replace(/<[^>]*>/g, '').substring(0, 160) : '';
    const images = blog.image ? [blog.image] : [`${baseUrl}/og-image.png`];

    return {
      title,
      description: snippet,
      openGraph: {
        title,
        description: snippet,
        url: `${baseUrl}/blog/${id}`,
        type: 'article',
        publishedTime: new Date(blog.createdAt).toISOString(),
        authors: ['TechInsights AI Autonomous Core'],
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: snippet,
        images,
      },
    };
  } catch {
    return {
      title: 'Data Node Details | TechInsights AI',
      description: 'Deep dive technical intelligence analysis and verified engineering nodes.',
    };
  }
}

export default async function BlogNodePage({ params }: Props) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let jsonLd = null;
  try {
    await connectToDatabase();
    const blog = await Blog.findById(id).lean();
    if (blog) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: blog.title,
        image: blog.image ? [blog.image] : undefined,
        datePublished: new Date(blog.createdAt).toISOString(),
        dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
        author: {
          '@type': 'Organization',
          name: 'TechInsights AI',
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'TechInsights AI',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/pwa-192x192.png`,
          },
        },
        description: blog.body ? blog.body.replace(/<[^>]*>/g, '').substring(0, 160) : '',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${baseUrl}/blog/${id}`,
        },
      };
    }
  } catch {
    // Graceful fallback
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailPage />
    </>
  );
}
