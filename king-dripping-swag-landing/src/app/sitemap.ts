import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://kingdrippingswag.io';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/outreach`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/seo-command`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pitch`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/mission-control`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];
}
