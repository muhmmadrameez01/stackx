import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedPosts, getAllCategories } from '@/lib/blogService';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, Clock, Eye, ArrowRight, ArrowLeft } from 'lucide-react';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const cat = categories.find(c => c.slug === slug);

  const title = cat ? `${cat.name} Guides & Articles | Stackx Blog` : 'Category Blog | Stackx';
  return {
    title,
    description: cat?.description || `Explore ${cat?.name || 'category'} articles and guides on Stackx.`,
  };
}

export default async function CategoryBlogPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const posts = await getPublishedPosts(undefined, slug);
  const categories = await getAllCategories();
  const currentCategory = categories.find(c => c.slug === slug);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <header className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" /> All Categories
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Category: <span className="text-red-500">{currentCategory?.name || slug}</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            {currentCategory?.description || 'Browse all published articles in this category.'}
          </p>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No articles published in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <article
                  key={post.id}
                  className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-200"
                >
                  <div>
                    {post.coverImage && (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="mt-2 text-slate-400 text-xs line-clamp-3">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 mt-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" /> {post.readingTime} min read
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-slate-300 group-hover:text-red-400 flex items-center gap-1"
                    >
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
