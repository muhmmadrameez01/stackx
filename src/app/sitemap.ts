import { MetadataRoute } from 'next';
import { getPublishedPosts, getAllCategories } from '@/lib/blogService';
import { TOOLS } from '@/config/tools';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackx.si';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Tool routes
  TOOLS.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/?tool=${tool.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Blog categories
  const categories = await getAllCategories();
  categories.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/blog/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // Published blog posts
  const posts = await getPublishedPosts();
  posts.forEach((post) => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  });

  return routes;
}
