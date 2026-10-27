"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { TOOLS } from '@/config/tools';
import { 
  BarChart3, 
  FileText, 
  FileCode, 
  Wrench, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  LogOut,
  User,
  Settings,
  Globe,
  Save,
  ArrowRight,
  PenTool,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImage?: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  readingTime?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  authorName?: string;
  createdAt: string;
  category?: { name: string } | null;
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  content: string;
}

const INITIAL_STATIC_PAGES: StaticPage[] = [
  {
    id: 'page-privacy',
    title: 'Privacy Policy & Zero Server Data Guarantee',
    slug: 'privacy-policy',
    lastUpdated: '2026-08-11',
    content: 'Stackx operates on a strict 100% client-side execution model. No files uploaded by users leave their local web browser memory.',
  },
  {
    id: 'page-terms',
    title: 'Terms of Service & Unlimited Free Usage',
    slug: 'terms-of-service',
    lastUpdated: '2026-08-11',
    content: 'All tools are provided 100% free without mandatory registration, credit limits, or subscription paywalls.',
  },
  {
    id: 'page-security',
    title: 'Client-Side Web Security Standards',
    slug: 'client-side-security',
    lastUpdated: '2026-08-11',
    content: 'Document manipulation, WebAssembly binary processing, and AI background removal run locally using WebGL and client JavaScript.',
  },
];

export default function CentralAdminDashboard() {
  const router = useRouter();

  // Authentication States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'editor' | 'static' | 'tools' | 'settings'>('overview');

  // Blog States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Editor Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCover, setPostCover] = useState('');
  const [postPublished, setPostPublished] = useState(true);
  const [postMetaTitle, setPostMetaTitle] = useState('');
  const [postMetaDesc, setPostMetaDesc] = useState('');
  const [postKeywords, setPostKeywords] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  // Static Pages States
  const [staticPages, setStaticPages] = useState<StaticPage[]>(INITIAL_STATIC_PAGES);
  const [selectedStatic, setSelectedStatic] = useState<StaticPage | null>(null);
  const [staticContent, setStaticContent] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('tools726_admin_auth');
    if (savedAuth === 'true') {
      setAuthenticated(true);
      fetchPosts();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Accept default admin@stackx.com or admin@tools726.com / stackxadmin or tools726admin
    if (
      email.trim() === 'admin@stackx.com' ||
      email.trim() === 'admin@tools726.com' ||
      password === 'stackxadmin' ||
      password === 'tools726admin'
    ) {
      localStorage.setItem('tools726_admin_auth', 'true');
      localStorage.setItem('stackx_admin_auth', 'true');
      setAuthenticated(true);
      fetchPosts();
    } else {
      setLoginError('Invalid email address or password credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tools726_admin_auth');
    setAuthenticated(false);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      setMessage('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': 'tools726admin' },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p.id !== id));
        setMessage('Post deleted successfully');
      } else {
        alert(data.error || 'Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  const handleEditClick = (post: Post) => {
    setEditId(post.id);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostSummary(post.summary);
    setPostContent(post.content || '');
    setPostCover(post.coverImage || '');
    setPostPublished(post.published);
    setPostMetaTitle(post.metaTitle || '');
    setPostMetaDesc(post.metaDescription || '');
    setPostKeywords(post.keywords || '');
    setActiveTab('editor');
  };

  const handleCreateNewClick = () => {
    setEditId(null);
    setPostTitle('');
    setPostSlug('');
    setPostSummary('');
    setPostContent('');
    setPostCover('');
    setPostPublished(true);
    setPostMetaTitle('');
    setPostMetaDesc('');
    setPostKeywords('');
    setActiveTab('editor');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postSlug || !postContent) {
      alert('Title, Slug, and Content are required!');
      return;
    }

    setSavingPost(true);
    const payload = {
      id: editId || undefined,
      title: postTitle,
      slug: postSlug,
      summary: postSummary,
      content: postContent,
      coverImage: postCover || null,
      published: postPublished,
      metaTitle: postMetaTitle || `${postTitle} | tools726 Blog`,
      metaDescription: postMetaDesc || postSummary,
      keywords: postKeywords,
      canonicalUrl: `http://localhost:3001/blog/${postSlug}`,
    };

    try {
      const res = await fetch('/api/admin/blog', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': 'tools726admin',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(editId ? 'Post updated successfully!' : 'Post created successfully!');
        fetchPosts();
        setActiveTab('blog');
      } else {
        alert(data.error || 'Failed to save post');
      }
    } catch (err) {
      alert('Error saving post');
    } finally {
      setSavingPost(false);
    }
  };

  const handleSaveStaticPage = () => {
    if (!selectedStatic) return;
    const updated = staticPages.map(p => 
      p.id === selectedStatic.id 
        ? { ...p, content: staticContent, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    );
    setStaticPages(updated);
    setMessage(`Saved updates for ${selectedStatic.title}`);
    setSelectedStatic(null);
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30 mx-auto mb-6 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-red-500 font-black text-xl">
              726
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-white tracking-tight mb-1">Admin Portal Login</h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Enter your admin email address and password to access the control center.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                placeholder="admin@tools726.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-white text-xs rounded-xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Sign In to Dashboard
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            Default credentials: <code className="text-slate-300">admin@stackx.com</code> / <code className="text-slate-300">stackxadmin</code>
          </div>
        </div>
      </div>
    );
  }

  // Stunning Main Admin Dashboard (Left Sidebar Layout)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80 mb-6">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              SX
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base leading-tight">Stackx</h2>
              <span className="text-[10px] font-semibold text-red-500 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/40">
                CONTROL CENTER
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'blog' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4" /> Blog Posts CMS
              </span>
              <span className="text-[10px] font-extrabold bg-slate-950 px-2 py-0.5 rounded-md text-slate-300">{posts.length}</span>
            </button>

            <button
              onClick={handleCreateNewClick}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <PenTool className="w-4 h-4" /> Write Article
            </button>

            <button
              onClick={() => setActiveTab('static')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'static' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <FileCode className="w-4 h-4" /> Static Pages
              </span>
              <span className="text-[10px] font-extrabold bg-slate-950 px-2 py-0.5 rounded-md text-slate-300">{staticPages.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'tools' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <Wrench className="w-4 h-4" /> Web Utilities
              </span>
              <span className="text-[10px] font-extrabold bg-slate-950 px-2 py-0.5 rounded-md text-slate-300">{TOOLS.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> System Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">Administrator</div>
              <div className="text-[10px] text-slate-400 truncate">admin@stackx.com</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-red-500" /> View Public Site
            </Link>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-8 flex-1">
          
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold flex justify-between items-center">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="hover:text-white">✕</button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Web Tools Suite</span>
                    <Wrench className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-3xl font-black text-white">{TOOLS.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Client-side Web utilities</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Published Articles</span>
                    <FileText className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-white">{posts.filter(p => p.published).length}</div>
                  <p className="text-[11px] text-slate-500 mt-1">SEO Optimized Guides</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Total Article Views</span>
                    <Eye className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-3xl font-black text-white">{totalViews}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Organic readership views</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span>Neon Database</span>
                    <Database className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Serverless Active
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Prisma 7 Edge Adapter</p>
                </div>

              </div>

              {/* Action Banner */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Quick Content Operations</h3>
                  <p className="text-xs text-slate-400">Publish articles, inspect search keywords, or edit privacy policies.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCreateNewClick}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Create Article
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BLOG CMS TABLE */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchPosts}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                  </button>

                  <button
                    onClick={handleCreateNewClick}
                    className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Write New Article
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Title & Slug</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Views</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">{post.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">/blog/{post.slug}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{post.category?.name || 'General'}</td>
                          <td className="px-6 py-4">
                            {post.published ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                                <CheckCircle className="w-3 h-3" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                                <XCircle className="w-3 h-3" /> Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-semibold">{post.views}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-800/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATED ARTICLE EDITOR */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">
                  {editId ? 'Edit Blog Article' : 'Create New Blog Article'}
                </h2>
                <button
                  type="submit"
                  disabled={savingPost}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingPost ? 'Saving...' : editId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Article Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. How to Merge PDF Files Online Privately"
                        value={postTitle}
                        onChange={(e) => {
                          setPostTitle(e.target.value);
                          if (!editId) {
                            setPostSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-base focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">URL Slug *</label>
                      <input
                        type="text"
                        value={postSlug}
                        onChange={(e) => setPostSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Summary / Excerpt</label>
                      <textarea
                        rows={2}
                        value={postSummary}
                        onChange={(e) => setPostSummary(e.target.value)}
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Markdown Content *</label>
                      <textarea
                        rows={14}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Publish Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Published Status</span>
                      <input
                        type="checkbox"
                        checked={postPublished}
                        onChange={(e) => setPostPublished(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Cover Image URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={postCover}
                        onChange={(e) => setPostCover(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: STATIC PAGES MANAGER */}
          {activeTab === 'static' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">Static Legal & Policy Pages</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                  {staticPages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => {
                        setSelectedStatic(page);
                        setStaticContent(page.content);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedStatic?.id === page.id ? 'bg-red-950/40 border-red-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                    >
                      <h4 className="font-bold text-white text-sm">{page.title}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">/{page.slug}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{page.content}</p>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  {selectedStatic ? (
                    <>
                      <h3 className="text-base font-bold text-white">Editing: {selectedStatic.title}</h3>
                      <textarea
                        rows={10}
                        value={staticContent}
                        onChange={(e) => setStaticContent(e.target.value)}
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono focus:border-red-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSaveStaticPage}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> Save Page Changes
                      </button>
                    </>
                  ) : (
                    <div className="py-20 text-center text-slate-500 text-xs">
                      Select a static page from the left list to edit its content.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TOOLS INDEX */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white font-sans">Active Web Utilities ({TOOLS.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOOLS.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">{t.category}</p>
                    </div>
                    {t.popular && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-950/60 border border-red-900/40 px-2 py-0.5 rounded">
                        POPULAR
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-lg font-bold text-white">System Settings & Security</h2>
              
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 border-b border-slate-800 pb-2">Admin Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
                    <input type="text" value="admin@stackx.com" disabled className="w-full px-3 py-2 rounded-lg bg-slate-950 text-xs text-slate-400 border border-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <input type="text" value="Active Administrator" disabled className="w-full px-3 py-2 rounded-lg bg-slate-950 text-xs text-emerald-400 border border-slate-800 font-bold" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 border-b border-slate-800 pb-2">Database Connection</h3>
                <p className="text-xs text-slate-400">Connected to Neon Serverless PostgreSQL with Prisma 7 Edge Driver Adapter.</p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
