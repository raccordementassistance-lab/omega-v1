import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://raccordement-assistance.fr";

const publicRoutes = [
  "",
  "/comprendre",
  "/faq",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
