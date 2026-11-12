"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  Clock,
  Image as ImageIcon,
  Upload,
  Maximize2,
  Minimize2,
  Columns,
  Edit3,
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
  X,
  Trash2,
  Sliders,
  Tag,
  HelpCircle,
  Calendar
} from 'lucide-react';

type DirectionType = 'center' | 'left' | 'right' | 'float-left' | 'float-right';

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
  const [postStatus, setPostStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [scheduledAt, setScheduledAt] = useState('');
  const [featured, setFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(3);
  const [authorName, setAuthorName] = useState('Stackx Team');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Editor Display View State
  const [editorView, setEditorView] = useState<'write' | 'split' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cover Image Upload State
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // In-Content Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageScale, setImageScale] = useState<number>(50); // 25, 50, 75, 100 or custom %
  const [imageDirection, setImageDirection] = useState<DirectionType>('center');
  const [uploadingInContent, setUploadingInContent] = useState(false);
  const [inContentUploadError, setInContentUploadError] = useState<string | null>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('stackx_admin_secret') || localStorage.getItem('tools726_admin_secret') || 'Allah@726';
    if (saved) setSecretKey(saved);

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

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
              let currentStatus = (found.status || (found.published ? 'published' : 'draft')) as 'published' | 'draft' | 'scheduled';
              if (currentStatus === 'scheduled' && found.scheduledAt && new Date(found.scheduledAt) <= new Date()) {
                currentStatus = 'published';
              }
              setPostStatus(currentStatus);
              setPublished(found.published);
              if (found.scheduledAt) {
                try {
                  const d = new Date(found.scheduledAt);
                  const pad = (n: number) => String(n).padStart(2, '0');
                  const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  setScheduledAt(localIso);
                } catch {
                  setScheduledAt('');
                }
              } else {
                setScheduledAt('');
              }
              setFeatured(found.featured);
              setReadingTime(found.readingTime || 3);
              setAuthorName(found.authorName || 'Stackx Team');
              setCategoryId(found.categoryId || '');
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

  // Helper to upload a file to /api/admin/upload
  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'x-admin-secret': secretKey,
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
      setCoverImage(url);
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
      setImageUrl(url);
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
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
    setContent(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Build HTML Snippet for Image insertion with chosen scale and direction
  const generateImageHtml = (url: string, alt: string, caption: string, scale: number, direction: DirectionType) => {
    const safeAlt = alt.trim() || 'Blog article image';
    const safeCaption = caption.trim();

    if (direction === 'float-left') {
      return `\n<div style="float: left; margin: 0.5rem 1.5rem 1rem 0; width: ${scale}%; max-width: 100%;">
  <img src="${url}" alt="${safeAlt}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: block;" />
  ${safeCaption ? `<p style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.35rem; text-align: center; font-style: italic;">${safeCaption}</p>` : ''}
</div>\n`;
    }

    if (direction === 'float-right') {
      return `\n<div style="float: right; margin: 0.5rem 0 1rem 1.5rem; width: ${scale}%; max-width: 100%;">
  <img src="${url}" alt="${safeAlt}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: block;" />
  ${safeCaption ? `<p style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.35rem; text-align: center; font-style: italic;">${safeCaption}</p>` : ''}
</div>\n`;
    }

    if (direction === 'left') {
      return `\n<figure style="margin: 1.5rem 0; text-align: left; max-width: 100%;">
  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />
  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: left; font-style: italic;">${safeCaption}</figcaption>` : ''}
</figure>\n`;
    }

    if (direction === 'right') {
      return `\n<figure style="margin: 1.5rem 0; text-align: right; max-width: 100%;">
  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />
  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: right; font-style: italic;">${safeCaption}</figcaption>` : ''}
</figure>\n`;
    }

    // Default 'center'
    return `\n<figure style="margin: 1.5rem auto; text-align: center; max-width: 100%;">
  <img src="${url}" alt="${safeAlt}" style="display: inline-block; width: ${scale}%; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);" />
  ${safeCaption ? `<figcaption style="font-size: 0.8125rem; color: #94a3b8; margin-top: 0.5rem; text-align: center; font-style: italic;">${safeCaption}</figcaption>` : ''}
</figure>\n`;
  };

  // Insert configured image into editor
  const handleInsertImageToEditor = () => {
    if (!imageUrl) {
      alert('Please select or upload an image first!');
      return;
    }

    const snippet = generateImageHtml(imageUrl, imageAlt, imageCaption, imageScale, imageDirection);
    insertAtCursor(snippet);

    // Reset modal fields and close
    setIsImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setImageScale(50);
    setImageDirection('center');
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
          setImageUrl(url);
          setImageAlt(file.name.replace(/\.[^/.]+$/, ''));
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
          setImageUrl(url);
          setImageAlt(file.name.replace(/\.[^/.]+$/, ''));
          setIsImageModalOpen(true);
        } catch (err: any) {
          alert('Failed to drop image: ' + err.message);
        }
      }
    }
  };

  // Word count & live read time estimation
  const wordCount = (content.trim().match(/\S+/g) || []).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      alert('Title, Slug, and Content are required!');
      return;
    }

    if (postStatus === 'scheduled' && !scheduledAt) {
      alert('Please choose a date and time to schedule this post!');
      return;
    }

    setSaving(true);
    setMessage(null);

    let isPublished = true;
    if (postStatus === 'draft') {
      isPublished = false;
    } else if (postStatus === 'scheduled') {
      isPublished = scheduledAt ? new Date(scheduledAt) <= new Date() : false;
    }

    const payload = {
      id: editId || undefined,
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      status: postStatus,
      scheduledAt: postStatus === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      published: isPublished,
      featured,
      readingTime: Number(readingTime) || estimatedReadTime,
      authorName,
      categoryId: categoryId || null,
      metaTitle: metaTitle || `${title} | Stackx Blog`,
      metaDescription: metaDescription || summary,
      keywords,
      canonicalUrl: canonicalUrl || `https://stackx.si/blog/${slug}`,
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
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto pb-6' : ''}`}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditorView('write')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorView === 'write' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Focused Write Mode"
              >
                <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Write</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorView('split')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorView === 'split' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Side-by-Side Split View"
              >
                <Columns className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorView('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${editorView === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Full Live Article Preview"
              >
                <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Writing"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-red-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 sm:px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : editId ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}

        {editorView === 'preview' ? (
          /* Full Page Article Preview */
          <div className="max-w-4xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
            <div className="border-b border-slate-800 pb-6 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-950/60 px-3 py-1 rounded-md border border-red-800/40">
                {categories.find(c => c.id === categoryId)?.name || 'General Article'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">{title || 'Untitled Post'}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                <span>By {authorName}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-500" /> {readingTime || estimatedReadTime} min read</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>
            </div>

            {coverImage && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <img src={coverImage} alt="Cover preview" className="w-full h-80 object-cover" />
              </div>
            )}

            <article
              className="blog-content prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedPreviewHtml }}
            />
          </div>
        ) : (
          /* Editor Layout (Write or Split View) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Form Column */}
            <div className={`${editorView === 'split' ? 'lg:col-span-8' : 'lg:col-span-8'} space-y-6`}>
              
              {/* Title & Slug */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., How to Convert PDF to Word Online Privately"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:border-red-500 focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline">https://stackx.si/blog/</span>
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

              {/* Summary / Excerpt */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Article Summary / Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="Brief 2-3 sentence summary for cards, listing, & meta descriptions..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:border-red-500 focus:outline-none"
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

                    {/* Bold, Italic, Underline, Strike */}
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
                      title="Task Checkbox List"
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

                    {/* Code, Table, Link */}
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
                      title="Insert Markdown Table"
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
                      title="Horizontal Divider"
                      className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      ―
                    </button>
                  </div>

                  {/* High-Converting Image Action Button */}
                  <div className="flex items-center gap-1.5">
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

                {/* Editor Content Area (Split View or Write Only) */}
                <div className={`grid ${editorView === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800' : 'grid-cols-1'}`}>
                  
                  {/* Left: Raw Markdown Editor */}
                  <div className="p-4 flex flex-col">
                    <textarea
                      ref={textareaRef}
                      rows={22}
                      placeholder="Write your article in Markdown here...

💡 Pro Tip:
• Paste images directly from clipboard (Ctrl+V)
• Drag & drop images directly onto this area
• Use the 'Insert Image' button to scale (25%, 50%, 75%, 100%) and set direction (center, left, right, float-left, float-right)!"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onPaste={handleTextareaPaste}
                      onDrop={handleTextareaDrop}
                      className="w-full h-full min-h-[460px] p-2 bg-transparent text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none resize-y placeholder-slate-600"
                    />
                  </div>

                  {/* Right: Live Real-Time Rendered Preview in Split Mode */}
                  {editorView === 'split' && (
                    <div className="p-6 bg-slate-950/60 overflow-y-auto max-h-[560px]">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                        <Eye className="w-3 h-3 text-red-400" /> Live Article Preview
                      </div>
                      <article
                        className="blog-content prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: parsedPreviewHtml || '<p class="text-slate-600 italic">Live preview will appear here as you type...</p>' }}
                      />
                    </div>
                  )}

                </div>

                {/* Bottom Editor Stats Bar */}
                <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <span><strong>{wordCount}</strong> words</span>
                    <span><strong>{content.length}</strong> characters</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" /> ~{estimatedReadTime} min read
                    </span>
                  </div>
                  <div className="text-slate-500 hidden sm:block">
                    Markdown & HTML supported • Drag & drop images
                  </div>
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
              
              {/* Publishing Controls with Draft & Schedule */}
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
                        setPublished(true);
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
                        setPublished(false);
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
                        setPublished(false);
                        if (!scheduledAt) {
                          const tomorrow = new Date(Date.now() + 86400000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          const localIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
                          setScheduledAt(localIso);
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
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
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
                      📅 This post will automatically go live on <strong>{scheduledAt ? new Date(scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'selected time'}</strong>. It will remain hidden from visitors until then.
                    </p>
                  </div>
                )}

                {/* Draft Status Explainer */}
                {postStatus === 'draft' && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Drafts are saved privately and never displayed to public visitors.</span>
                  </div>
                )}

                {/* Published Status Explainer */}
                {postStatus === 'published' && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>This article will be instantly visible on <strong>stackx.si/blog</strong>.</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Featured Spotlight</span>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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

                {/* If coverImage exists, show preview */}
                {coverImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 group shadow-md">
                      <img src={coverImage} alt="Cover preview" className="w-full h-44 object-cover" />
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
                          onClick={() => setCoverImage('')}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {coverImage}
                    </div>
                  </div>
                ) : showCoverUrlInput ? (
                  /* Manual URL Input */
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500">Paste an external CDN, S3, or Unsplash image link.</p>
                  </div>
                ) : (
                  /* Direct Drag & Drop Upload Zone */
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

            </div>

          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* ⭐ IN-CONTENT IMAGE INSERTER MODAL (SCALE & DIRECTION) ⭐ */}
      {/* ============================================================ */}
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
                      {uploadingInContent ? 'Uploading image...' : imageUrl ? 'Click to replace uploaded file' : 'Click to select or drag & drop image'}
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
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
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
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Step 1: Uploading documents"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ⭐ Image Scale Selector ⭐ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-red-500" /> Image Scale / Size ({imageScale}%)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {imageScale <= 30 ? 'Small (Thumbnail)' : imageScale <= 60 ? 'Medium (Standard)' : imageScale <= 85 ? 'Large (Prominent)' : 'Full Width (100%)'}
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
                      onClick={() => setImageScale(preset.pct)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        imageScale === preset.pct
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
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
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
                    onClick={() => setImageDirection('center')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageDirection === 'center'
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
                    onClick={() => setImageDirection('left')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageDirection === 'left'
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
                    onClick={() => setImageDirection('right')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageDirection === 'right'
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
                    onClick={() => setImageDirection('float-left')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageDirection === 'float-left'
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
                    onClick={() => setImageDirection('float-right')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageDirection === 'float-right'
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
              {imageUrl && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-red-400" /> Live Simulation Preview
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden text-xs text-slate-400 leading-relaxed font-sans">
                    {/* Rendered according to direction */}
                    {imageDirection === 'float-left' ? (
                      <div>
                        <div style={{ float: 'left', margin: '0 1rem 0.5rem 0', width: `${imageScale}%`, maxWidth: '100%' }}>
                          <img src={imageUrl} alt={imageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {imageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{imageCaption}</p>}
                        </div>
                        <p>
                          This sample paragraph shows how your article text flows seamlessly around the image. With <strong>Float Left</strong>, the image sits on the left side and your reader's text naturally wraps to its right.
                        </p>
                        <div style={{ clear: 'both' }} />
                      </div>
                    ) : imageDirection === 'float-right' ? (
                      <div>
                        <div style={{ float: 'right', margin: '0 0 0.5rem 1rem', width: `${imageScale}%`, maxWidth: '100%' }}>
                          <img src={imageUrl} alt={imageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {imageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{imageCaption}</p>}
                        </div>
                        <p>
                          This sample paragraph shows how your article text flows seamlessly around the image. With <strong>Float Right</strong>, the image sits on the right side and your reader's text naturally wraps to its left.
                        </p>
                        <div style={{ clear: 'both' }} />
                      </div>
                    ) : (
                      <div className={`text-${imageDirection}`}>
                        <div style={{ display: 'inline-block', width: `${imageScale}%`, maxWidth: '100%' }}>
                          <img src={imageUrl} alt={imageAlt} className="rounded-lg w-full h-auto object-cover" />
                          {imageCaption && <p className="text-[10px] text-slate-500 text-center italic mt-1">{imageCaption}</p>}
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
                disabled={!imageUrl}
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

export default function AdminBlogEditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-400 text-center">Loading editor...</div>}>
      <EditorForm />
    </Suspense>
  );
}
