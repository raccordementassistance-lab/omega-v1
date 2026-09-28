import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://raccordement-assistance.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/espace-client/", "/espace-conseiller/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
