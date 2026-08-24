import type { MetadataRoute } from "next";

const SITE_URL = "https://erobo.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/inventaris",
        "/diklat",
      ]
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}