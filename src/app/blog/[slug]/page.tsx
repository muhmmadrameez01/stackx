import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/blogService';
import { marked } from 'marked';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Tag,
  Wrench
} from 'lucide-react';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Stackx',
    };
  }

  const title = post.metaTitle || `${post.title} | Stackx Blog`;
  const description = post.metaDescription || post.summary;
  const url = post.canonicalUrl || `https://stackx.si/blog/${post.slug}`;
  const keywords = post.keywords ? post.keywords.split(',').map(k => k.trim()) : [];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.authorName],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // HTML content rendering from Markdown
  const htmlContent = marked.parse(post.content || '') as string;

  // JSON-LD Schema.org Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl || `https://stackx.si/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.summary,
    image: post.coverImage || undefined,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stackx',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stackx.si/logo.svg',
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://stackx.si',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://stackx.si/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: post.canonicalUrl || `https://stackx.si/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Inject JSON-LD Schema.org Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        {/* Article Header */}
        <header className="border-b border-slate-800/80 bg-slate-900/40 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 text-red-500" /> Back to Articles
            </Link>

            {post.category && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-3 py-1 rounded-md border border-red-800/40 mb-3">
                {post.category.name}
              </span>
            )}

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
              <span className="font-semibold text-slate-200">By {post.authorName}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-500" /> {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> {post.views} views
              </span>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          )}

          {/* Embedded Interactive Tools Callout */}
          <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Try Online Utilities on Stackx</h4>
                <p className="text-xs text-slate-400">100% Client-Side Privacy. No files leave your device.</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shrink-0"
            >
              Launch Tools
            </Link>
          </div>

          {/* Markdown Rendered Content */}
          <article
            className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-a:text-red-400 prose-strong:text-slate-100 prose-code:text-red-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 leading-relaxed text-sm sm:text-base text-slate-300"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags Footer */}
          {post.keywords && (
            <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              {post.keywords.split(',').map((kw, i) => (
                <span key={i} className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg">
                  #{kw.trim()}
                </span>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
