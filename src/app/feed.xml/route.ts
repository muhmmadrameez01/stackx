import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/blogService';

export async function GET() {
  const posts = await getPublishedPosts();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackx.si';

  const rssItemsXml = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.summary}]]></description>
      <author>${post.authorName}</author>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Stackx Official Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Guides, tutorials, and insights on PDF tools, image processing, network security, and client-side privacy.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
