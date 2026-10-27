"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe, 
  Sparkles, 
  Search, 
  FileText, 
  CheckCircle,
  Clock
} from 'lucide-react';

function EditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [secretKey, setSecretKey] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(3);
  const [authorName, setAuthorName] = useState('Stackx Team');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tools726_admin_secret');
    if (saved) setSecretKey(saved);

    if (editId) {
      // Fetch post details for editing
      fetch(`/api/blog`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.posts) {
            const found = data.posts.find((p: any) => p.id === editId);
            if (found) {
              setTitle(found.title || '');
              setSlug(found.slug || '');
              setSummary(found.summary || '');
              setContent(found.content || '');
              setCoverImage(found.coverImage || '');
              setPublished(found.published);
              setFeatured(found.featured);
              setReadingTime(found.readingTime || 3);
              setAuthorName(found.authorName || 'Stackx Team');
              setMetaTitle(found.metaTitle || '');
              setMetaDescription(found.metaDescription || '');
              setKeywords(found.keywords || '');
              setCanonicalUrl(found.canonicalUrl || '');
            }
          }
        });
    }
  }, [editId]);

  // Auto-generate slug when title changes
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      alert('Title, Slug, and Content are required!');
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      id: editId || undefined,
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      published,
      featured,
      readingTime: Number(readingTime) || 3,
      authorName,
      metaTitle: metaTitle || `${title} | Stackx Blog`,
      metaDescription: metaDescription || summary,
      keywords,
      canonicalUrl: canonicalUrl || `http://localhost:3001/blog/${slug}`,
    };

    try {
      const res = await fetch('/api/admin/blog', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secretKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(editId ? 'Post updated successfully!' : 'Post created successfully!');
        setTimeout(() => {
          router.push('/admin/blog');
        }, 1200);
      } else {
        alert(data.error || 'Failed to save post');
      }
    } catch (err) {
      alert('Error saving post');
    } finally {
      setSaving(false);
    }
  };

  const parsedPreviewHtml = marked.parse(content || '') as string;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'editor' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Write Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Live Preview
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : editId ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}

        {activeTab === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Form Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Title & Slug */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., How to Convert PDF to Word Online Privately"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">http://localhost:3001/blog/</span>
                    <input
                      type="text"
                      placeholder="how-to-convert-pdf-to-word"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary & Content */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Article Summary / Excerpt</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 2-3 sentence summary for listing cards & meta description..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Markdown Content *</label>
                  <textarea
                    rows={16}
                    placeholder="Write article in Markdown format (# Heading, ## Subheading, [Link Text](url), etc.)..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono leading-relaxed focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Google SERP Snippet Preview Widget */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Google SERP Snippet Preview</h3>
                </div>

                <div className="p-4 rounded-xl bg-white text-slate-900 shadow-lg">
                  <div className="text-[11px] text-[#202124] flex items-center gap-1.5 mb-1 font-sans">
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">S</span>
                    <span className="truncate">Stackx › blog › {slug || 'article-slug'}</span>
                  </div>
                  <div className="text-base text-[#1a0dab] font-normal hover:underline cursor-pointer truncate">
                    {metaTitle || title || 'Article Title - Stackx Blog'}
                  </div>
                  <div className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed font-sans">
                    {metaDescription || summary || 'Your article description will appear here in Google search engine result snippets.'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      placeholder="Title tag for search engines..."
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Keywords</label>
                    <input
                      type="text"
                      placeholder="merge pdf, pdf online, privacy..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Meta Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Publishing Controls */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Publishing Status</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Published Status</span>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Featured Spotlight</span>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Estimated Read Time (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Image URL</h3>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                />
                {coverImage && (
                  <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* Live Markdown Preview Tab */
          <div className="max-w-4xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
            <h1 className="text-3xl font-extrabold text-white mb-4">{title || 'Untitled Post'}</h1>
            {coverImage && (
              <img src={coverImage} alt="Cover" className="w-full h-72 object-cover rounded-2xl mb-6" />
            )}
            <article
              className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedPreviewHtml }}
            />
          </div>
        )}

      </main>
    </div>
  );
}

export default function AdminBlogEditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-400 text-center">Loading editor...</div>}>
      <EditorForm />
    </Suspense>
  );
}
