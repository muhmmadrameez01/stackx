"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Cloud,
  LogOut,
  User,
  Settings,
  Globe,
  Save,
  ArrowRight,
  PenTool,
  Sparkles,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Copy,
  ExternalLink,
  Layers,
  Sliders,
  Image as ImageIcon,
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  MoveLeft,
  MoveRight,
  Clock,
  Columns,
  X,
  Calendar
} from 'lucide-react';
import type { AdSenseConfig, AdSenseAnalytics } from '@/types';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImage?: string | null;
  published: boolean;
  scheduledAt?: string | null;
  status?: 'published' | 'draft' | 'scheduled';
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
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'editor' | 'static' | 'tools' | 'settings' | 'monetization'>('overview');

  // AdSense States
  const [adConfig, setAdConfig] = useState<AdSenseConfig>({
    enabled: false,
    publisherId: '',
    autoAds: true,
    testMode: true,
    slots: {
      headerBanner: '',
      toolResultBanner: '',
      toolBottomBanner: '',
      blogSidebarBanner: '',
    },
    adsTxt: '',
    api: {
      clientId: '',
      clientSecret: '',
      refreshToken: '',
      accountId: '',
    },
    estimatedCpc: 0.25,
  });
  const [adAnalytics, setAdAnalytics] = useState<AdSenseAnalytics | null>(null);
  const [loadingAdSense, setLoadingAdSense] = useState(false);
  const [savingAdSense, setSavingAdSense] = useState(false);
  const [adSenseSavedMessage, setAdSenseSavedMessage] = useState<string | null>(null);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);
  const [chartView, setChartView] = useState<'7d' | '14d'>('14d');

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
  const [postStatus, setPostStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [postScheduledAt, setPostScheduledAt] = useState('');
  const [postMetaTitle, setPostMetaTitle] = useState('');
  const [postMetaDesc, setPostMetaDesc] = useState('');
  const [postKeywords, setPostKeywords] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  // Editor View & Image Modal States for Tab 3 (Write Article)
  const [editorSubView, setEditorSubView] = useState<'write' | 'split' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cover image upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // In-content image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [inContentImageUrl, setInContentImageUrl] = useState('');
  const [inContentImageAlt, setInContentImageAlt] = useState('');
  const [inContentImageCaption, setInContentImageCaption] = useState('');
  const [inContentImageScale, setInContentImageScale] = useState<number>(50);
  const [inContentImageDirection, setInContentImageDirection] = useState<'center' | 'left' | 'right' | 'float-left' | 'float-right'>('center');
  const [uploadingInContent, setUploadingInContent] = useState(false);
  const [inContentUploadError, setInContentUploadError] = useState<string | null>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // Static Pages States
  const [staticPages, setStaticPages] = useState<StaticPage[]>(INITIAL_STATIC_PAGES);
  const [selectedStatic, setSelectedStatic] = useState<StaticPage | null>(null);
  const [staticContent, setStaticContent] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('stackx_admin_auth') || localStorage.getItem('tools726_admin_auth');
    if (savedAuth === 'true') {
      setAuthenticated(true);
      fetchPosts();
      fetchAdSense();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('stackx_admin_auth', 'true');
        localStorage.setItem('tools726_admin_auth', 'true');
        if (data.secretKey) {
          localStorage.setItem('stackx_admin_secret', data.secretKey);
          localStorage.setItem('tools726_admin_secret', data.secretKey);
        }
        setAuthenticated(true);
        fetchPosts();
        fetchAdSense();
      } else {
        setLoginError(data.error || 'Invalid email address or password.');
      }
    } catch {
      setLoginError('An error occurred during sign-in. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stackx_admin_auth');
    localStorage.removeItem('stackx_admin_secret');
    localStorage.removeItem('tools726_admin_auth');
    localStorage.removeItem('tools726_admin_secret');
    setAuthenticated(false);
  };

  const getAdminSecret = () => {
    return localStorage.getItem('stackx_admin_secret') || localStorage.getItem('tools726_admin_secret') || 'Allah@726';
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let res = await fetch('/api/admin/blog', {
        headers: { 'x-admin-secret': getAdminSecret() },
      });
      if (!res.ok) {
        res = await fetch('/api/blog');
      }
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch {
      setMessage('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdSense = async () => {
    setLoadingAdSense(true);
    try {
      const res = await fetch('/api/admin/adsense', {
        headers: { 'x-admin-secret': getAdminSecret() },
      });
      const data = await res.json();
      if (data.success) {
        if (data.config) setAdConfig(data.config);
        if (data.analytics) setAdAnalytics(data.analytics);
      }
    } catch (err) {
      console.warn('Failed to load AdSense data:', err);
    } finally {
      setLoadingAdSense(false);
    }
  };

  const handleSaveAdSense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdSense(true);
    setAdSenseSavedMessage(null);
    try {
      const res = await fetch('/api/admin/adsense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret(),
        },
        body: JSON.stringify(adConfig),
      });
      const data = await res.json();
      if (data.success) {
        setAdConfig(data.config);
        setAdSenseSavedMessage('Google AdSense configuration saved successfully!');
        fetchAdSense();
        setTimeout(() => setAdSenseSavedMessage(null), 5000);
      } else {
        alert(data.error || 'Failed to save AdSense settings.');
      }
    } catch {
      alert('An error occurred while saving AdSense settings.');
    } finally {
      setSavingAdSense(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': getAdminSecret() },
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
    
    // Status & Schedule
    const currentStatus = (post.status || (post.published ? 'published' : 'draft')) as 'published' | 'draft' | 'scheduled';
    setPostStatus(currentStatus);
    setPostPublished(post.published);
    if (post.scheduledAt) {
      try {
        const d = new Date(post.scheduledAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setPostScheduledAt(localIso);
      } catch {
        setPostScheduledAt('');
      }
    } else {
      setPostScheduledAt('');
    }

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
    setPostStatus('published');
    setPostPublished(true);
    setPostScheduledAt('');
    setPostMetaTitle('');
    setPostMetaDesc('');
    setPostKeywords('');
    setActiveTab('editor');
  };

  // Helper to upload image to /api/admin/upload
  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'x-admin-secret': getAdminSecret(),
      },
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload image');
    }
    return data.url;
  };

  // Handle Cover Image Upload
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setCoverUploadError(null);

    try {
      const url = await uploadImageToServer(file);
      setPostCover(url);
    } catch (err: any) {
      setCoverUploadError(err.message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Handle In-Content Image Upload
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInContent(true);
    setInContentUploadError(null);

    try {
      const url = await uploadImageToServer(file);
      setInContentImageUrl(url);
      if (!inContentImageAlt) {
        setInContentImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err: any) {
      setInContentUploadError(err.message || 'Image upload failed');
    } finally {
      setUploadingInContent(false);
      if (contentImageInputRef.current) contentImageInputRef.current.value = '';
    }
  };

  // Insert text / markdown wrapper at cursor in textarea
  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    const replacement = before + (selectedText || '') + after;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setPostContent(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Build HTML Snippet for Image insertion with chosen scale and direction
  const generateImageHtml = (url: string, alt: string, caption: string, scale: number, direction: 'center' | 'left' | 'right' | 'float-left' | 'float-right') => {
    const safeAlt = alt.trim() || 'Blog article image';
    const safeCaption = caption.trim();

    if (direction === 'float-left') {
      return `\n<div style="float: left; margin: 0.5rem 1.5rem 1rem 0; width: ${scale}%; max-width: 100%;">\n  <img src="${url}" alt="${safeAlt}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: block;" />\n  ${safeCaption ? `<p style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.35rem; text-align: center; font-style: italic;">${safeCaption}</p>` : ''}\n</div>\n`;
    }

    if (direction === 'float-right') {
      return `\n<div style="float: right; margin: 0.5rem 0 1rem 1.5rem; width: ${scale}%; max-width: 100%;">\n  <img src="${url}" alt="${safeAlt}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: block;" />\n  ${safeCaption ? `<p style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.35rem; text-align: center; font-style: italic;">${safeCaption}</p>` : ''}\n</div>\n`;
    }

    if (direction === 'left') {
      return `\n<figure style="margin: 1.5rem 0; text-align: left; max-width: 100%;">\n  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />\n  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: left; font-style: italic;">${safeCaption}</figcaption>` : ''}\n</figure>\n`;
    }

    if (direction === 'right') {
      return `\n<figure style="margin: 1.5rem 0; text-align: right; max-width: 100%;">\n  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />\n  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: right; font-style: italic;">${safeCaption}</figcaption>` : ''}\n</figure>\n`;
    }

    // Default 'center'
    return `\n<figure style="margin: 1.5rem auto; text-align: center; max-width: 100%;">\n  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />\n  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: center; font-style: italic;">${safeCaption}</figcaption>` : ''}\n</figure>\n`;
  };

  // Insert configured image into editor
  const handleInsertImageToEditor = () => {
    if (!inContentImageUrl) {
      alert('Please select or upload an image first!');
      return;
    }

    const snippet = generateImageHtml(inContentImageUrl, inContentImageAlt, inContentImageCaption, inContentImageScale, inContentImageDirection);
    insertAtCursor(snippet);

    // Reset modal fields and close
    setIsImageModalOpen(false);
    setInContentImageUrl('');
    setInContentImageAlt('');
    setInContentImageCaption('');
    setInContentImageScale(50);
    setInContentImageDirection('center');
  };

  // Drag and Drop & Paste handling for editor textarea
  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const url = await uploadImageToServer(file);
          setInContentImageUrl(url);
          setInContentImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          setIsImageModalOpen(true);
        } catch (err: any) {
          alert('Failed to paste image: ' + err.message);
        }
      }
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const url = await uploadImageToServer(file);
          setInContentImageUrl(url);
          setInContentImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          setIsImageModalOpen(true);
        } catch (err: any) {
          alert('Failed to drop image: ' + err.message);
        }
      }
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postSlug || !postContent) {
      alert('Title, Slug, and Content are required!');
      return;
    }

    if (postStatus === 'scheduled' && !postScheduledAt) {
      alert('Please choose a date and time to schedule this post!');
      return;
    }

    setSavingPost(true);

    let isPublished = true;
    if (postStatus === 'draft') {
      isPublished = false;
    } else if (postStatus === 'scheduled') {
      isPublished = postScheduledAt ? new Date(postScheduledAt) <= new Date() : false;
    }

    const payload = {
      id: editId || undefined,
      title: postTitle,
      slug: postSlug,
      summary: postSummary,
      content: postContent,
      coverImage: postCover || null,
      status: postStatus,
      scheduledAt: postStatus === 'scheduled' && postScheduledAt ? new Date(postScheduledAt).toISOString() : null,
      published: isPublished,
      metaTitle: postMetaTitle || `${postTitle} | Stackx Blog`,
      metaDescription: postMetaDesc || postSummary,
      keywords: postKeywords,
      canonicalUrl: `https://stackx.si/blog/${postSlug}`,
    };

    try {
      const res = await fetch('/api/admin/blog', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getAdminSecret(),
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
              SX
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-white tracking-tight mb-1">StackX Admin Portal</h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Enter your admin credentials to access the control center.
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
                placeholder="admin@stackx.si"
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
              disabled={loggingIn}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> {loggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>
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
              onClick={() => setActiveTab('monetization')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'monetization' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Monetization & Ads
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${adConfig.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-400'}`}>
                {adConfig.enabled ? 'Active' : 'Setup'}
              </span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                
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

                {/* AdSense Revenue Overview Card */}
                <div 
                  onClick={() => setActiveTab('monetization')}
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                    <span className="text-emerald-400 font-bold">AdSense Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    ${adAnalytics ? adAnalytics.earningsToday.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    {adAnalytics?.clicksToday || 0} Clicks • RPM: ${adAnalytics?.pageRpm.toFixed(2) || '0.00'}
                  </p>
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
                            {post.status === 'scheduled' || (post.scheduledAt && new Date(post.scheduledAt) > new Date()) ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/40">
                                <Clock className="w-3 h-3 text-purple-400" /> Scheduled
                                {post.scheduledAt && (
                                  <span className="text-[9px] text-purple-300 font-mono opacity-80">
                                    ({new Date(post.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                                  </span>
                                )}
                              </span>
                            ) : post.status === 'draft' || !post.published ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">
                                <FileText className="w-3 h-3 text-amber-400" /> Draft
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                                <CheckCircle className="w-3 h-3 text-emerald-400" /> Published
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
              {/* Header with Title, View Modes & Save Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-red-500" />
                    {editId ? 'Edit Blog Article' : 'Create New Blog Article'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Write rich content with custom scaled & aligned images</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Modes */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setEditorSubView('write')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorSubView === 'write' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Write Mode"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Write</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorSubView('split')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorSubView === 'split' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Side-by-Side Split View"
                    >
                      <Columns className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Split View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorSubView('preview')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorSubView === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Full Article Preview"
                    >
                      <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPost}
                    className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 text-white ${
                      postStatus === 'draft' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' :
                      postStatus === 'scheduled' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' :
                      'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    }`}
                  >
                    <Save className="w-4 h-4" /> {
                      savingPost ? 'Saving...' : 
                      postStatus === 'draft' ? (editId ? 'Update Draft' : 'Save Draft') :
                      postStatus === 'scheduled' ? (editId ? 'Update Schedule' : 'Schedule Article') :
                      editId ? 'Update Article' : 'Publish Article'
                    }
                  </button>
                </div>
              </div>

              {/* Full Article Preview Mode */}
              {editorSubView === 'preview' ? (
                <div className="max-w-4xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-white">{postTitle || 'Untitled Post'}</h1>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                      <span>By Stackx Editorial</span>
                      <span>•</span>
                      <span>{(postContent.trim().match(/\S+/g) || []).length} words</span>
                    </div>
                  </div>

                  {postCover && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl max-h-96">
                      <img src={postCover} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <article
                    className="blog-content prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: marked.parse(postContent || '') as string }}
                  />
                </div>
              ) : (
                /* Standard Write & Split View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column (8 cols): Title, Summary, Toolbar, Editor */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Title & Slug */}
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
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-base focus:border-red-500 focus:outline-none placeholder-slate-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">URL Slug *</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-mono hidden sm:inline">https://stackx.si/blog/</span>
                          <input
                            type="text"
                            value={postSlug}
                            onChange={(e) => setPostSlug(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary / Excerpt */}
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Summary / Excerpt</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary for listings & search results..."
                        value={postSummary}
                        onChange={(e) => setPostSummary(e.target.value)}
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    {/* Rich Markdown Editor Card */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                      
                      {/* Modern Formatting Toolbar */}
                      <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                          
                          {/* Headings */}
                          <button
                            type="button"
                            onClick={() => insertAtCursor('# ', '')}
                            title="Heading 1"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Heading1 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('## ', '')}
                            title="Heading 2"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Heading2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('### ', '')}
                            title="Heading 3"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Heading3 className="w-4 h-4" />
                          </button>

                          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

                          {/* Text Formats */}
                          <button
                            type="button"
                            onClick={() => insertAtCursor('**', '**')}
                            title="Bold (**text**)"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('*', '*')}
                            title="Italic (*text*)"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('<u>', '</u>')}
                            title="Underline"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Underline className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('~~', '~~')}
                            title="Strikethrough"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Strikethrough className="w-4 h-4" />
                          </button>

                          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

                          {/* Lists & Quotes */}
                          <button
                            type="button"
                            onClick={() => insertAtCursor('- ', '')}
                            title="Bullet List"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('1. ', '')}
                            title="Numbered List"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('- [ ] ', '')}
                            title="Task List"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('> ', '')}
                            title="Blockquote"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Quote className="w-4 h-4" />
                          </button>

                          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

                          {/* Code, Table, Link, Divider */}
                          <button
                            type="button"
                            onClick={() => insertAtCursor('`', '`')}
                            title="Inline Code"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1 | Data | Data |\n| Row 2 | Data | Data |\n', '')}
                            title="Insert Table"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <TableIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('[Link Text](https://', ')')}
                            title="Insert Link"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertAtCursor('\n---\n', '')}
                            title="Divider"
                            className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            ―
                          </button>
                        </div>

                        {/* ⭐ High-Converting Image Action Button ⭐ */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Insert Image (Scale & Align)</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Area (Split Mode or Write Mode) */}
                      <div className={`grid ${editorSubView === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800' : 'grid-cols-1'}`}>
                        {/* Textarea */}
                        <div className="p-4 flex flex-col">
                          <textarea
                            ref={textareaRef}
                            rows={18}
                            placeholder="Write your article in Markdown here...

💡 Pro Tips:
• Paste images directly from clipboard (Ctrl+V)
• Drag & drop images directly onto this editor
• Click 'Insert Image (Scale & Align)' to scale (25%, 50%, 75%, 100%) and choose direction (Center, Left, Right, Float Left, Float Right)!"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            onPaste={handleTextareaPaste}
                            onDrop={handleTextareaDrop}
                            className="w-full h-full min-h-[420px] p-2 bg-transparent text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none resize-y placeholder-slate-600"
                          />
                        </div>

                        {/* Split View Live Preview */}
                        {editorSubView === 'split' && (
                          <div className="p-5 bg-slate-950/60 overflow-y-auto max-h-[520px]">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                              <Eye className="w-3 h-3 text-red-400" /> Live Article Preview
                            </div>
                            <article
                              className="blog-content prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: (marked.parse(postContent || '') as string) || '<p class="text-slate-600 italic">Live preview will appear here as you type...</p>' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Editor Bottom Stats Bar */}
                      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-4">
                          <span><strong>{(postContent.trim().match(/\S+/g) || []).length}</strong> words</span>
                          <span><strong>{postContent.length}</strong> characters</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-500" /> ~{Math.max(1, Math.ceil((postContent.trim().match(/\S+/g) || []).length / 200))} min read
                          </span>
                        </div>
                        <div className="text-slate-500 hidden sm:block">
                          Drag & drop or paste (Ctrl+V) images
                        </div>
                      </div>

                    </div>

                    {/* SEO Preview & Meta Tags */}
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Search className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Google SERP Snippet Preview</h3>
                      </div>

                      <div className="p-4 rounded-xl bg-white text-slate-900 shadow-md">
                        <div className="text-[11px] text-[#202124] flex items-center gap-1.5 mb-1 font-sans">
                          <span className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">S</span>
                          <span className="truncate">Stackx › blog › {postSlug || 'article-slug'}</span>
                        </div>
                        <div className="text-base text-[#1a0dab] font-normal hover:underline cursor-pointer truncate">
                          {postMetaTitle || postTitle || 'Article Title - Stackx Blog'}
                        </div>
                        <div className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed font-sans">
                          {postMetaDesc || postSummary || 'Your article description will appear here in Google search engine result snippets.'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">SEO Title Tag</label>
                          <input
                            type="text"
                            placeholder="Title tag for search engines..."
                            value={postMetaTitle}
                            onChange={(e) => setPostMetaTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Keywords</label>
                          <input
                            type="text"
                            placeholder="merge pdf, pdf online, privacy..."
                            value={postKeywords}
                            onChange={(e) => setPostKeywords(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (4 cols): Cover Image Upload & Publish Settings */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Cover Image Upload Card */}
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-red-500" /> Cover Image
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                          className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                        >
                          {showCoverUrlInput ? 'Switch to Upload' : 'Enter URL instead'}
                        </button>
                      </div>

                      {coverUploadError && (
                        <div className="p-2 rounded-lg bg-red-950/60 border border-red-800 text-red-400 text-xs">
                          {coverUploadError}
                        </div>
                      )}

                      {/* If postCover exists, show preview */}
                      {postCover ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border border-slate-800 group shadow-md">
                            <img src={postCover} alt="Cover preview" className="w-full h-44 object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => coverFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => setPostCover('')}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {postCover}
                          </div>
                        </div>
                      ) : showCoverUrlInput ? (
                        /* Manual URL Input */
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={postCover}
                            onChange={(e) => setPostCover(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">Paste external CDN, S3, or Unsplash link.</p>
                        </div>
                      ) : (
                        /* Direct Drag & Drop File Upload Zone */
                        <div>
                          <input
                            ref={coverFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileUpload}
                            className="hidden"
                          />
                          <div
                            onClick={() => coverFileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform">
                              {uploadingCover ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-200">
                              {uploadingCover ? 'Uploading file...' : 'Upload Cover Image'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP, or SVG up to 15MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Publishing Settings with Draft & Schedule */}
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-500" /> Publish Settings
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          postStatus === 'published' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                          postStatus === 'scheduled' ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40' :
                          'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}>
                          {postStatus}
                        </span>
                      </div>

                      {/* 3 Status Choices: Publish Now, Draft, Schedule */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Selection</label>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {/* Publish Now */}
                          <button
                            type="button"
                            onClick={() => {
                              setPostStatus('published');
                              setPostPublished(true);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              postStatus === 'published'
                                ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <CheckCircle className={`w-4 h-4 mx-auto mb-1 ${postStatus === 'published' ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <div className="text-[11px] font-bold">Publish</div>
                            <div className="text-[9px] text-slate-500">Live now</div>
                          </button>

                          {/* Draft */}
                          <button
                            type="button"
                            onClick={() => {
                              setPostStatus('draft');
                              setPostPublished(false);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              postStatus === 'draft'
                                ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <FileText className={`w-4 h-4 mx-auto mb-1 ${postStatus === 'draft' ? 'text-amber-400' : 'text-slate-500'}`} />
                            <div className="text-[11px] font-bold">Draft</div>
                            <div className="text-[9px] text-slate-500">Hidden</div>
                          </button>

                          {/* Schedule */}
                          <button
                            type="button"
                            onClick={() => {
                              setPostStatus('scheduled');
                              setPostPublished(false);
                              if (!postScheduledAt) {
                                const tomorrow = new Date(Date.now() + 86400000);
                                const pad = (n: number) => String(n).padStart(2, '0');
                                const localIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
                                setPostScheduledAt(localIso);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              postStatus === 'scheduled'
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <Clock className={`w-4 h-4 mx-auto mb-1 ${postStatus === 'scheduled' ? 'text-purple-400' : 'text-slate-500'}`} />
                            <div className="text-[11px] font-bold">Schedule</div>
                            <div className="text-[9px] text-slate-500">Set Date</div>
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Date & Time Picker */}
                      {postStatus === 'scheduled' && (
                        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2 animate-in fade-in duration-150">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Auto-Publish Date & Time *
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="datetime-local"
                              value={postScheduledAt}
                              onChange={(e) => setPostScheduledAt(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                              style={{ colorScheme: 'dark' }}
                              onClick={(e) => {
                                try {
                                  // @ts-ignore
                                  if (typeof e.currentTarget.showPicker === 'function') {
                                    // @ts-ignore
                                    e.currentTarget.showPicker();
                                  }
                                } catch {}
                              }}
                              className="admin-calendar-input w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-purple-500/60 text-white text-xs font-mono focus:border-purple-400 focus:outline-none cursor-pointer"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-white">
                              <Calendar className="w-4 h-4 text-white" style={{ color: '#ffffff' }} />
                            </div>
                          </div>
                          <p className="text-[10px] text-purple-300/80 leading-relaxed">
                            📅 This post will automatically go live on <strong>{postScheduledAt ? new Date(postScheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'selected time'}</strong>. It will remain hidden from visitors until then.
                          </p>
                        </div>
                      )}

                      {/* Draft Status Explainer */}
                      {postStatus === 'draft' && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                          <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>Drafts are saved privately and will not be visible to public visitors.</span>
                        </div>
                      )}

                      {/* Published Status Explainer */}
                      {postStatus === 'published' && (
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>Upon saving, this article will immediately be live on <strong>stackx.si/blog</strong>.</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}
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

          {/* TAB: MONETIZATION & GOOGLE ADSENSE */}
          {activeTab === 'monetization' && (
            <div className="space-y-8 max-w-5xl">
              
              {/* Header with Live Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" /> Google AdSense & Revenue Dashboard
                    </h2>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      adConfig.enabled && adConfig.publisherId
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-amber-950/80 border-amber-800 text-amber-400'
                    }`}>
                      {adConfig.enabled && adConfig.publisherId ? '● Live & Active' : '● Setup Required'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      adAnalytics?.isGoogleConnected
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                        : 'bg-blue-950/80 border-blue-800 text-blue-300'
                    }`}>
                      {adAnalytics?.isGoogleConnected ? '● Google API Synced' : '● Real Traffic Tracker (Zero Dummy)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your Google AdSense Publisher ID, inspect live revenue/clicks, and control banner placements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={adConfig.publisherId ? `https://www.google.com/adsense/new/u/0/${adConfig.publisherId.replace(/^ca-/, '')}/home` : 'https://www.google.com/adsense'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Official Google Console ↗
                  </a>
                  <button
                    onClick={fetchAdSense}
                    disabled={loadingAdSense}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAdSense ? 'animate-spin' : ''}`} /> Refresh Stats
                  </button>
                  <Link
                    href="/ads.txt"
                    target="_blank"
                    className="px-3.5 py-2 text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View /ads.txt
                  </Link>
                </div>
              </div>

              {/* Real Data Transparency Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      100% Real Data Mode Active
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        Zero Dummy Numbers
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All metrics below reflect genuine visitor impressions and clicks recorded on <strong>stackx.si</strong>. Dummy generated numbers have been removed.
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0 font-mono">
                  Source: <span className="text-white font-semibold">{adAnalytics?.isGoogleConnected ? 'Google AdSense API' : 'Real Visitor Events (MySQL)'}</span>
                </div>
              </div>

              {adSenseSavedMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{adSenseSavedMessage}</span>
                </div>
              )}

              {/* 1. REVENUE METRICS CARDS */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Revenue & Earnings Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                      <span>Today's Estimated</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">
                      ${adAnalytics ? adAnalytics.earningsToday.toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      RPM: ${adAnalytics ? adAnalytics.pageRpm.toFixed(2) : '0.00'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Yesterday's Earnings</div>
                    <div className="text-3xl font-black text-slate-200 font-mono">
                      ${adAnalytics ? adAnalytics.earningsYesterday.toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Previous 24 hours</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Last 7 Days</div>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      ${adAnalytics ? adAnalytics.earningsLast7Days.toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Weekly ad revenue</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Last 28 Days (Monthly)</div>
                    <div className="text-3xl font-black text-cyan-400 font-mono">
                      ${adAnalytics ? adAnalytics.earningsLast28Days.toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Estimated payout cycle</p>
                  </div>
                </div>
              </div>

              {/* 2. AD PERFORMANCE METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Today's Impressions</div>
                  <div className="text-xl font-bold text-white mt-1 font-mono">{adAnalytics?.impressionsToday.toLocaleString() || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Today's Clicks</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{adAnalytics?.clicksToday || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Click-Through Rate (CTR)</div>
                  <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{adAnalytics?.ctr || 0}%</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Average Page RPM</div>
                  <div className="text-xl font-bold text-purple-400 mt-1 font-mono">${adAnalytics?.pageRpm || '0.00'}</div>
                </div>
              </div>

              {/* 3. VISUAL REVENUE & CLICKS TREND CHART */}
              {adAnalytics && adAnalytics.dailyTrend.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" /> Revenue & Clicks Performance Trend
                      </h4>
                      <p className="text-[11px] text-slate-400">Daily earnings in USD ($) and ad click volumes over time.</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setChartView('7d')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${chartView === '7d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartView('14d')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${chartView === '14d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        14 Days
                      </button>
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  {(() => {
                    const dataPoints = chartView === '7d' ? adAnalytics.dailyTrend.slice(-7) : adAnalytics.dailyTrend;
                    const maxRevenue = Math.max(...dataPoints.map(d => d.revenue), 10);
                    return (
                      <div className="space-y-2">
                        <div className="h-48 w-full flex items-end gap-2 sm:gap-4 pt-6 px-2">
                          {dataPoints.map((dp, idx) => {
                            const barHeightPercent = Math.max(12, Math.round((dp.revenue / maxRevenue) * 100));
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                {/* Hover Tooltip */}
                                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white border border-slate-700 text-[10px] font-mono py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                  <div className="text-emerald-400 font-bold">${dp.revenue.toFixed(2)}</div>
                                  <div className="text-slate-400">{dp.clicks} clicks • {dp.impressions} views</div>
                                </div>

                                <div
                                  style={{ height: `${barHeightPercent}%` }}
                                  className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600/80 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all cursor-pointer relative shadow-lg shadow-emerald-950/40"
                                >
                                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${dp.revenue.toFixed(0)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Dates on X Axis */}
                        <div className="flex gap-2 sm:gap-4 px-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                          {dataPoints.map((dp, idx) => (
                            <div key={idx} className="flex-1 text-center truncate">
                              {dp.date}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. TOP PLACEMENTS BREAKDOWN */}
              {adAnalytics && adAnalytics.placementsBreakdown.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Revenue by Ad Unit Placement
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                          <th className="pb-3">Ad Unit Placement</th>
                          <th className="pb-3">Impressions</th>
                          <th className="pb-3">Clicks</th>
                          <th className="pb-3">Revenue ($)</th>
                          <th className="pb-3 text-right">Revenue Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {adAnalytics.placementsBreakdown.map((place, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 font-semibold text-white">{place.name}</td>
                            <td className="py-3 text-slate-300 font-mono">{place.impressions.toLocaleString()}</td>
                            <td className="py-3 text-emerald-400 font-mono">{place.clicks}</td>
                            <td className="py-3 font-bold text-white font-mono">${place.revenue.toFixed(2)}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                    style={{ width: `${place.percentage}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-300 w-8">{place.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. CONFIGURATION & CONTROLS FORM */}
              <form onSubmit={handleSaveAdSense} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" /> Google AdSense Dynamic Controls
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Toggle ads on or off, configure your Publisher ID, and manage slot IDs without editing code.
                  </p>
                </div>

                {/* Master Switch & Mode Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Master AdSense Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    adConfig.enabled 
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">AdSense Status</span>
                      <input
                        type="checkbox"
                        checked={adConfig.enabled}
                        onChange={(e) => setAdConfig({ ...adConfig, enabled: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs font-semibold">{adConfig.enabled ? 'Enabled (Ads Active)' : 'Disabled (All Ads Hidden)'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Master switch to turn all website ads on or off instantly.</p>
                  </div>

                  {/* Auto Ads Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Auto Ads</span>
                      <input
                        type="checkbox"
                        checked={adConfig.autoAds}
                        onChange={(e) => setAdConfig({ ...adConfig, autoAds: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white">{adConfig.autoAds ? 'Auto Ads Active' : 'Auto Ads Off'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Google AI automatically optimizes ad placement locations.</p>
                  </div>

                  {/* Test Mode Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    adConfig.testMode 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Test / Preview Mode</span>
                      <input
                        type="checkbox"
                        checked={adConfig.testMode}
                        onChange={(e) => setAdConfig({ ...adConfig, testMode: e.target.checked })}
                        className="w-5 h-5 accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs font-semibold">{adConfig.testMode ? 'Preview Mode Enabled' : 'Live Production Mode'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Displays preview banner boxes to test layouts before approval.</p>
                  </div>

                </div>

                {/* Publisher ID Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Google AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ca-pub-1234567890123456"
                    value={adConfig.publisherId}
                    onChange={(e) => setAdConfig({ ...adConfig, publisherId: e.target.value.trim() })}
                    className="w-full px-4 py-3 text-sm font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Find this in your Google AdSense dashboard under <span className="text-slate-300 font-semibold">Account &gt; Settings &gt; Account Information</span>.
                  </p>
                </div>

                {/* Ad Slots Section */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Individual Banner Slot IDs (Optional / Advanced)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Header Banner Slot ID (728 × 90)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234567890"
                        value={adConfig.slots.headerBanner}
                        onChange={(e) => setAdConfig({ ...adConfig, slots: { ...adConfig.slots, headerBanner: e.target.value.trim() } })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Tool Result / Download Area Slot ID (Highest CTR)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={adConfig.slots.toolResultBanner}
                        onChange={(e) => setAdConfig({ ...adConfig, slots: { ...adConfig.slots, toolResultBanner: e.target.value.trim() } })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Tool Workspace Footer Slot ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5432167890"
                        value={adConfig.slots.toolBottomBanner}
                        onChange={(e) => setAdConfig({ ...adConfig, slots: { ...adConfig.slots, toolBottomBanner: e.target.value.trim() } })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Blog Sidebar Ad Slot ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 6789012345"
                        value={adConfig.slots.blogSidebarBanner}
                        onChange={(e) => setAdConfig({ ...adConfig, slots: { ...adConfig.slots, blogSidebarBanner: e.target.value.trim() } })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ads.txt Section */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      ads.txt Record (Google Verification)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (adConfig.adsTxt) {
                          navigator.clipboard.writeText(adConfig.adsTxt);
                          setCopiedAdsTxt(true);
                          setTimeout(() => setCopiedAdsTxt(false), 2500);
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copiedAdsTxt ? 'Copied!' : 'Copy ads.txt'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
                    value={adConfig.adsTxt}
                    onChange={(e) => setAdConfig({ ...adConfig, adsTxt: e.target.value })}
                    className="w-full p-3 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Served live at <code className="text-emerald-400">/ads.txt</code> to verify site ownership for Google AdSense crawlers.
                  </p>
                </div>

                {/* Google Cloud API Integration (Optional Direct Sync) */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Cloud className="w-4 h-4" /> Google AdSense API Sync (Direct Official Sync)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Optional: Connect your Google Cloud OAuth2 credentials to pull official revenue reports directly from Google servers.
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start border ${
                      adConfig.api?.refreshToken ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}>
                      {adConfig.api?.refreshToken ? '✓ Google API Connected' : 'Local Traffic Tracking'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Google Cloud OAuth Client ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789-xxx.apps.googleusercontent.com"
                        value={adConfig.api?.clientId || ''}
                        onChange={(e) => setAdConfig({
                          ...adConfig,
                          api: { ...(adConfig.api || {}), clientId: e.target.value.trim() },
                        })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Google Cloud Client Secret
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••••••••••"
                        value={adConfig.api?.clientSecret || ''}
                        onChange={(e) => setAdConfig({
                          ...adConfig,
                          api: { ...(adConfig.api || {}), clientSecret: e.target.value.trim() },
                        })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Google OAuth Refresh Token
                      </label>
                      <input
                        type="password"
                        placeholder="1//04xxxxxxxxxxxxxxxxxxxxxxx"
                        value={adConfig.api?.refreshToken || ''}
                        onChange={(e) => setAdConfig({
                          ...adConfig,
                          api: { ...(adConfig.api || {}), refreshToken: e.target.value.trim() },
                        })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Local Estimated Value Per Click (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.25"
                        value={adConfig.estimatedCpc || 0.25}
                        onChange={(e) => setAdConfig({
                          ...adConfig,
                          estimatedCpc: parseFloat(e.target.value) || 0.25,
                        })}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={savingAdSense}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {savingAdSense ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving Configuration...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save AdSense Settings
                      </>
                    )}
                  </button>
                </div>

              </form>

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

      {/* ⭐ IN-CONTENT IMAGE INSERTER MODAL (SCALE & DIRECTION) ⭐ */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Insert & Format Image</h3>
                  <p className="text-[11px] text-slate-400">Scale dimensions and set alignment / text wrapping</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Image Source Mode Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${imageSourceMode === 'upload' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${imageSourceMode === 'url' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Globe className="w-3.5 h-3.5" /> Image URL
                </button>
              </div>

              {inContentUploadError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-400 text-xs">
                  {inContentUploadError}
                </div>
              )}

              {/* Source Input Area */}
              {imageSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={contentImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => contentImageInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform">
                      {uploadingInContent ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      {uploadingInContent ? 'Uploading image...' : inContentImageUrl ? 'Click to replace uploaded file' : 'Click to select or drag & drop image'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP, SVG or GIF</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Image URL *</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={inContentImageUrl}
                    onChange={(e) => setInContentImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Alt Text & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Alt Text (SEO & Accessibility)</label>
                  <input
                    type="text"
                    placeholder="e.g., PDF to Word converter interface"
                    value={inContentImageAlt}
                    onChange={(e) => setInContentImageAlt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Step 1: Uploading documents"
                    value={inContentImageCaption}
                    onChange={(e) => setInContentImageCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ⭐ Image Scale Selector ⭐ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-red-500" /> Image Scale / Size ({inContentImageScale}%)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {inContentImageScale <= 30 ? 'Small (Thumbnail)' : inContentImageScale <= 60 ? 'Medium (Standard)' : inContentImageScale <= 85 ? 'Large (Prominent)' : 'Full Width (100%)'}
                  </span>
                </div>

                {/* Preset Scale Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Small', pct: 25 },
                    { label: 'Medium', pct: 50 },
                    { label: 'Large', pct: 75 },
                    { label: 'Full (100%)', pct: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.pct}
                      type="button"
                      onClick={() => setInContentImageScale(preset.pct)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        inContentImageScale === preset.pct
                          ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {preset.label} <span className="text-[10px] opacity-75">({preset.pct}%)</span>
                    </button>
                  ))}
                </div>

                {/* Range Slider for custom scale */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">15%</span>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={inContentImageScale}
                    onChange={(e) => setInContentImageScale(Number(e.target.value))}
                    className="flex-1 accent-red-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">100%</span>
                </div>
              </div>

              {/* ⭐ Image Direction / Alignment ⭐ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Image Direction & Text Wrap
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Center */}
                  <button
                    type="button"
                    onClick={() => setInContentImageDirection('center')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      inContentImageDirection === 'center'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4 mx-auto mb-1 text-red-400" />
                    <div className="text-[11px] font-bold">Center</div>
                    <div className="text-[9px] text-slate-500">Standard Block</div>
                  </button>

                  {/* Left */}
                  <button
                    type="button"
                    onClick={() => setInContentImageDirection('left')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      inContentImageDirection === 'left'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4 mx-auto mb-1 text-red-400" />
                    <div className="text-[11px] font-bold">Left</div>
                    <div className="text-[9px] text-slate-500">Block Left</div>
                  </button>

                  {/* Right */}
                  <button
                    type="button"
                    onClick={() => setInContentImageDirection('right')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      inContentImageDirection === 'right'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <AlignRight className="w-4 h-4 mx-auto mb-1 text-red-400" />
                    <div className="text-[11px] font-bold">Right</div>
                    <div className="text-[9px] text-slate-500">Block Right</div>
                  </button>

                  {/* Float Left */}
                  <button
                    type="button"
                    onClick={() => setInContentImageDirection('float-left')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      inContentImageDirection === 'float-left'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <MoveLeft className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <div className="text-[11px] font-bold">Float Left</div>
                    <div className="text-[9px] text-slate-500">Text on Right</div>
                  </button>

                  {/* Float Right */}
                  <button
                    type="button"
                    onClick={() => setInContentImageDirection('float-right')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      inContentImageDirection === 'float-right'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <MoveRight className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <div className="text-[11px] font-bold">Float Right</div>
                    <div className="text-[9px] text-slate-500">Text on Left</div>
                  </button>
                </div>
              </div>

              {/* Live Interactive Preview Box in Modal */}
              {inContentImageUrl && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-red-400" /> Live Simulation Preview
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden text-xs text-slate-400 leading-relaxed font-sans">
                    {inContentImageDirection === 'float-left' ? (
                      <div>
                        <div style={{ float: 'left', margin: '0 1rem 0.5rem 0', width: `${inContentImageScale}%`, maxWidth: '100%' }}>
                          <img src={inContentImageUrl} alt={inContentImageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {inContentImageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{inContentImageCaption}</p>}
                        </div>
                        <p>
                          This sample paragraph shows how your article text flows seamlessly around the image. With <strong>Float Left</strong>, the image sits on the left side and your reader's text naturally wraps to its right.
                        </p>
                        <div style={{ clear: 'both' }} />
                      </div>
                    ) : inContentImageDirection === 'float-right' ? (
                      <div>
                        <div style={{ float: 'right', margin: '0 0 0.5rem 1rem', width: `${inContentImageScale}%`, maxWidth: '100%' }}>
                          <img src={inContentImageUrl} alt={inContentImageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {inContentImageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{inContentImageCaption}</p>}
                        </div>
                        <p>
                          This sample paragraph shows how your article text flows seamlessly around the image. With <strong>Float Right</strong>, the image sits on the right side and your reader's text naturally wraps to its left.
                        </p>
                        <div style={{ clear: 'both' }} />
                      </div>
                    ) : (
                      <div className={`text-${inContentImageDirection}`}>
                        <div style={{ display: 'inline-block', width: `${inContentImageScale}%`, maxWidth: '100%' }}>
                          <img src={inContentImageUrl} alt={inContentImageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {inContentImageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{inContentImageCaption}</p>}
                        </div>
                        <p className="text-left mt-2">
                          Standard paragraph text follows underneath the centered or aligned block figure.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImageToEditor}
                disabled={!inContentImageUrl}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Insert into Article
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
