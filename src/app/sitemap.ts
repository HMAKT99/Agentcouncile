import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aiagentcouncil.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/join`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/council`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/grievances`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/members`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/knowledge`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/resolutions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/providers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/charter`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/developers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
