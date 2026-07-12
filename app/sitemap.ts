import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use environment variable site URL or default vercel domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://danh-sach-liet-si-hdvnu.vercel.app";

  const paths = ["", "/tu-ky", "/minh-duc", "/quang-khai", "/quang-phuc"];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1.0 : 0.8,
  }));
}
