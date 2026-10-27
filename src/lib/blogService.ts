import { db } from './db';

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  readingTime: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  schemaType: string;
  authorName: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount?: number;
}

// Initial Sample Blog Posts for immediate presentation & fallback
const SAMPLE_CATEGORIES: BlogCategoryItem[] = [
  { id: 'cat-pdf', name: 'PDF Utilities', slug: 'pdf-utilities', description: 'Guides on merging, editing, converting, and securing PDF documents.' },
  { id: 'cat-media', name: 'Media Processing', slug: 'media-processing', description: 'Tips and tricks for image conversion, compression, background removal, and video workflows.' },
  { id: 'cat-security', name: 'Network & Security', slug: 'network-security', description: 'Deep dives into IP analysis, DNS tools, password generators, and web security.' },
  { id: 'cat-seo', name: 'SEO & Web Tools', slug: 'seo-web-tools', description: 'Meta tag generator guides, schema markup, and performance optimization for websites.' },
];

const INITIAL_POSTS: BlogPostItem[] = [
  {
    id: 'post-1',
    title: 'How to Merge PDF Files Online Without Quality Loss & Complete Privacy',
    slug: 'how-to-merge-pdf-files-online-privacy',
    summary: 'Discover how to combine multiple PDF documents into one seamless file right in your web browser without uploading sensitive files to external servers.',
    content: `
# How to Merge PDF Files Online Without Quality Loss & Complete Privacy

Merging multiple PDF files into a single consolidated document is one of the most common everyday digital tasks. Whether you are combining invoices for accounting, compiling research chapters, or creating a comprehensive portfolio, having a reliable PDF merger is essential.

## Why Client-Side PDF Merging Matters

Most free online PDF tools require you to upload your confidential files to remote servers. This introduces privacy risks for sensitive documents like financial statements, contracts, or personal IDs.

With **Stackx**, all PDF processing is performed **100% inside your local browser memory** using WebAssembly and client-side JavaScript. Your files **never leave your device**.

### Key Advantages of Local PDF Merging:
1. **Zero Data Leaks**: Your document content remains strictly private on your computer or phone.
2. **Instant Performance**: No waiting for multi-megabyte uploads over slow internet connections.
3. **No File Size Caps**: Process large documents without restrictive paywalls.

---

## Step-by-Step Guide to Merge PDFs on Stackx

1. Visit our **[Merge PDF Tool](https://stackx.si/?tool=merge-pdf)** in your web browser.
2. Drag and drop the PDF files you wish to merge into the drop area.
3. Drag to reorder the pages or files into your desired sequence.
4. Click **"Merge & Download PDF"**.

Within seconds, your newly combined document is rendered locally and ready for immediate download!

---

## Frequently Asked Questions

### Can I merge password-protected PDFs?
Yes! Simply unlock the document using our **[Unlock PDF Tool](https://stackx.si/?tool=unlock-pdf)** before merging.

### Does merging affect the original font resolution or images?
No. **Stackx** preserves vector text formatting, embedded fonts, and original image resolution without re-compressing quality unless specified.
    `,
    coverImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
    published: true,
    featured: true,
    views: 342,
    readingTime: 4,
    metaTitle: 'How to Merge PDF Files Online Privately | Stackx Guide',
    metaDescription: 'Learn how to combine multiple PDF files in your browser safely without uploading files to third-party servers.',
    keywords: 'merge pdf, combine pdf, private pdf merger, online pdf tool',
    canonicalUrl: 'https://stackx.si/blog/how-to-merge-pdf-files-online-privacy',
    schemaType: 'BlogPosting',
    authorName: 'Stackx Engineering',
    categoryId: 'cat-pdf',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    category: SAMPLE_CATEGORIES[0],
  },
  {
    id: 'post-2',
    title: 'The Ultimate Guide to Removing Image Backgrounds Automatically with AI',
    slug: 'ultimate-guide-removing-image-backgrounds-ai',
    summary: 'Learn how AI-powered background removal works directly in web browsers and how to extract transparent PNG cutouts for e-commerce and graphics.',
    content: `
# The Ultimate Guide to Removing Image Backgrounds Automatically with AI

Clean product cutouts and transparent profile pictures can make or break digital design work. Traditionally, clipping backgrounds required manual pen tool selection in Photoshop—a process taking minutes per image.

Today, machine learning models like **@imgly/background-removal** allow background elimination in seconds!

## How AI Background Removal Works

Modern deep learning vision models analyze pixel luminance, edge contrast, and semantic shapes to identify subject contours (people, products, animals, cars) and mask out everything else.

### Benefits of Stackx Background Remover:
- **Automatic Transparency**: Export high-res PNG images with alpha channels instantly.
- **Client-Side AI**: Powered by WebGL/WASM directly in your browser.
- **Free for Unlimited Images**: No registration or credits required.

Try it now on our **[AI Background Remover Tool](https://stackx.si/?tool=image-background-remover)**!
    `,
    coverImage: 'https://images.unsplash.com/photo-1542744094-3a3121691a51?auto=format&fit=crop&w=1200&q=80',
    published: true,
    featured: false,
    views: 218,
    readingTime: 3,
    metaTitle: 'AI Background Removal Guide | Free Online Tool',
    metaDescription: 'Extract transparent image cutouts for e-commerce, logos, and graphics using browser AI.',
    keywords: 'remove background, bg remover, transparent png, ai image tool',
    canonicalUrl: 'https://stackx.si/blog/ultimate-guide-removing-image-backgrounds-ai',
    schemaType: 'BlogPosting',
    authorName: 'Media Tech Desk',
    categoryId: 'cat-media',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    category: SAMPLE_CATEGORIES[1],
  },
  {
    id: 'post-3',
    title: 'Essential Web & Network Security Tools Every Developer Should Know',
    slug: 'essential-web-network-security-tools-developers',
    summary: 'A comprehensive walkthrough of IP lookup, DNS record checks, SSL validator, and client-side password generators for web security.',
    content: `
# Essential Web & Network Security Tools Every Developer Should Know

Debugging network issues, verifying domain records, and testing SSL certificates are everyday requirements for developers and system administrators.

Here is a quick look at fundamental tools available on **Stackx**:

1. **IP Address Lookup**: Instantly inspect your public IPv4/IPv6 address, ISP, location, and ASN info.
2. **DNS Record Inspector**: Query A, AAAA, MX, CNAME, and TXT records across global DNS resolvers.
3. **Strong Password Generator**: Create cryptographically secure random passwords using Web Crypto API.

Explore all utilities in our **[Network & Security Section](https://stackx.si)**.
    `,
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    published: true,
    featured: false,
    views: 195,
    readingTime: 5,
    metaTitle: 'Developer Web & Network Security Tools Guide',
    metaDescription: 'Learn how to inspect IP addresses, DNS records, and build secure workflows.',
    keywords: 'ip lookup, dns checker, password generator, web security tools',
    canonicalUrl: 'https://stackx.si/blog/essential-web-network-security-tools-developers',
    schemaType: 'BlogPosting',
    authorName: 'Security Ops Team',
    categoryId: 'cat-security',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    category: SAMPLE_CATEGORIES[2],
  },
];

let inMemoryPosts = [...INITIAL_POSTS];

export async function getAllCategories(): Promise<BlogCategoryItem[]> {
  try {
    const categories = await db.category.findMany();
    if (categories.length > 0) {
      return categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      }));
    }
  } catch (err) {
    // Database fallback
  }
  return SAMPLE_CATEGORIES;
}

export async function getPublishedPosts(query?: string, categorySlug?: string): Promise<BlogPostItem[]> {
  try {
    const where: any = { published: true };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const posts = await db.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    if (posts.length > 0) {
      let filtered = posts.map((p: any) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q));
      }
      return filtered;
    }
  } catch (err) {
    // Database fallback
  }

  let posts = inMemoryPosts.filter((p: BlogPostItem) => p.published);
  if (categorySlug) {
    posts = posts.filter((p: BlogPostItem) => p.category?.slug === categorySlug);
  }
  if (query) {
    const q = query.toLowerCase();
    posts = posts.filter((p: BlogPostItem) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q));
  }
  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (post) {
      // Increment views count async
      db.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      }).catch(() => {});

      return {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    // Database fallback
  }

  const found = inMemoryPosts.find((p: BlogPostItem) => p.slug === slug);
  if (found) {
    found.views += 1;
    return found;
  }
  return null;
}

export async function createBlogPost(data: Omit<BlogPostItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<BlogPostItem> {
  const newId = `post-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    const created = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        published: data.published,
        featured: data.featured,
        readingTime: data.readingTime || 3,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        canonicalUrl: data.canonicalUrl,
        schemaType: data.schemaType || 'BlogPosting',
        authorName: data.authorName || 'Stackx Team',
        categoryId: data.categoryId || null,
      },
      include: { category: true },
    });

    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  } catch (err) {
    // Memory fallback
    const category = SAMPLE_CATEGORIES.find((c: BlogCategoryItem) => c.id === data.categoryId) || null;
    const newPost: BlogPostItem = {
      ...data,
      id: newId,
      views: 0,
      createdAt: now,
      updatedAt: now,
      category,
    };
    inMemoryPosts.unshift(newPost);
    return newPost;
  }
}

export async function updateBlogPost(id: string, data: Partial<BlogPostItem>): Promise<BlogPostItem | null> {
  try {
    const updated = await db.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        published: data.published,
        featured: data.featured,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        canonicalUrl: data.canonicalUrl,
        authorName: data.authorName,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (err) {
    const idx = inMemoryPosts.findIndex((p: BlogPostItem) => p.id === id);
    if (idx !== -1) {
      inMemoryPosts[idx] = { ...inMemoryPosts[idx], ...data, updatedAt: new Date().toISOString() };
      return inMemoryPosts[idx];
    }
  }
  return null;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    await db.blogPost.delete({ where: { id } });
    return true;
  } catch (err) {
    const idx = inMemoryPosts.findIndex((p: BlogPostItem) => p.id === id);
    if (idx !== -1) {
      inMemoryPosts.splice(idx, 1);
      return true;
    }
  }
  return false;
}
