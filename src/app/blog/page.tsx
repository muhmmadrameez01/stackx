import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedPosts, getAllCategories } from '@/lib/blogService';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, Calendar, Clock, Eye, ArrowRight, Tag, Search, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog & Tutorials | Stackx - Master Digital Productivity',
  description: 'Expert guides, tutorials, and insights on PDF editing, image conversion, Web security, and online tools privacy.',
  openGraph: {
    title: 'Stackx Official Blog - Guides & Online Utilities',
    description: 'Learn how to optimize workflows, merge PDFs privately, and use AI background removal.',
    type: 'website',
  },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  const categories = await getAllCategories();

  const featuredPost = posts.find(p => p.featured) || posts[0];
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* Header Banner */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-slate-800/80 w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Knowledge Base & Tutorials</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Master Digital Tools & Privacy
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          In-depth articles, workflow tutorials, and technical insights for PDF editing, image AI, web security, and SEO optimization.
        </p>

        {/* Categories Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white shadow-sm"
          >
            All Articles ({posts.length})
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/blog/category/${cat.slug}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Featured Post Spotlight */}
        {featuredPost && (
          <section className="mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Featured Spotlight
            </h2>
            <div className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden hover:border-red-500/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
              {featuredPost.coverImage && (
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
                </div>
              )}
              <div className={`p-6 sm:p-10 flex flex-col justify-between ${featuredPost.coverImage ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                <div>
                  {featuredPost.category && (
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2.5 py-1 rounded-md border border-red-800/40 mb-3">
                      {featuredPost.category.name}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {featuredPost.summary}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-500" /> {featuredPost.readingTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {featuredPost.views} views
                    </span>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Latest Guides & Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map(post => (
              <article
                key={post.id}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
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
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40 mb-2.5 inline-block">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-slate-400 text-xs line-clamp-3 leading-relaxed">
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
                    className="font-bold text-slate-300 group-hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
