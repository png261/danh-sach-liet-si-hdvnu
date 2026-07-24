import { Suspense } from "react";
import type { Metadata } from "next";
import CemeteryClient from "../CemeteryClient";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Martyr } from "@/app/types/martyr";
import { cacheLife } from "next/cache";
import { SLUG_TO_CEMETERY } from "@/app/lib/martyrUtils";

export const unstable_instant = { 
  prefetch: "static",
  unstable_disableValidation: true,
};

type Props = {
  params: Promise<{ cemetery: string }>;
};

// Define static parameters for static site generation
export async function generateStaticParams() {
  return [
    { cemetery: "tu-ky" },
    { cemetery: "minh-duc" },
    { cemetery: "quang-khai" },
    { cemetery: "quang-phuc" },
  ];
}

// Dynamically generate SEO metadata for each page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const cemeterySlug = resolvedParams.cemetery;

  let title = "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ";
  let description = "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội.";
  
  if (cemeterySlug) {
    const clean = cemeterySlug.toLowerCase();
    if (clean === "tu-ky" || clean === "tu_ky") {
      title = "Nghĩa Trang Liệt Sĩ Xã Tứ Kỳ | Cổng Tra Cứu Phần Mộ Liệt Sĩ";
      description = "Bản đồ số và thông tin tra cứu phần mộ Anh hùng Liệt sĩ tại Nghĩa trang liệt sĩ xã Tứ Kỳ, huyện Tứ Kỳ, tỉnh Hải Dương.";
    } else if (clean === "minh-duc" || clean === "minh_duc") {
      title = "Nghĩa Trang Liệt Sĩ Minh Đức | Cổng Tra Cứu Phần Mộ Liệt Sĩ";
      description = "Bản đồ số và thông tin tra cứu phần mộ Anh hùng Liệt sĩ tại Nghĩa trang liệt sĩ Minh Đức, huyện Tứ Kỳ, tỉnh Hải Dương.";
    } else if (clean === "quang-khai" || clean === "quang_khai") {
      title = "Nghĩa Trang Liệt Sĩ Quang Khải | Cổng Tra Cứu Phần Mộ Liệt Sĩ";
      description = "Bản đồ số và thông tin tra cứu phần mộ Anh hùng Liệt sĩ tại Nghĩa trang liệt sĩ Quang Khải, huyện Tứ Kỳ, tỉnh Hải Dương.";
    } else if (clean === "quang-phuc" || clean === "quang_phuc") {
      title = "Nghĩa Trang Liệt Sĩ Quang Phục | Cổng Tra Cứu Phần Mộ Liệt Sĩ";
      description = "Bản đồ số và thông tin tra cứu phần mộ Anh hùng Liệt sĩ tại Nghĩa trang liệt sĩ Quang Phục, huyện Tứ Kỳ, tỉnh Hải Dương.";
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Nghĩa trang xã Tứ Kỳ",
      locale: "vi_VN",
      images: [
        {
          url: `/api/og?cemetery=${cemeterySlug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?cemetery=${cemeterySlug}`],
    },
  };
}

// Cached function to fetch martyrs on the server with local dataset fallback
async function fetchMartyrs(cemeteryName: string, cemeterySlug: string): Promise<Martyr[]> {
  "use cache";
  cacheLife("hours"); // Cache the query result for hours

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("martyrs")
        .select("*")
        .eq("cemetery", cemeteryName);

      if (data && data.length > 0 && !error) {
        return data.map((m: Martyr) => ({ ...m, cemetery: m.cemetery.normalize("NFC") }));
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to local JSON data:", err);
  }

  // Fallback to local static JSON file in public/data/
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", "data", `${cemeterySlug}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.map((m: Martyr) => ({ ...m, cemetery: m.cemetery.normalize("NFC") }));
  } catch (err) {
    console.error("Local JSON fallback failed:", err);
    return [];
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const cemeterySlug = resolvedParams.cemetery;
  const cemeteryName = SLUG_TO_CEMETERY[cemeterySlug?.toLowerCase() ?? ""];

  let martyrs: Martyr[] = [];
  if (cemeteryName && cemeterySlug) {
    martyrs = await fetchMartyrs(cemeteryName, cemeterySlug);
  }

  // Schema.org Structured Data for SEO optimization
  const isTuKy = cemeterySlug === "tu-ky" || cemeterySlug === "tu_ky";
  const isMinhDuc = cemeterySlug === "minh-duc" || cemeterySlug === "minh_duc";
  const isQuangKhai = cemeterySlug === "quang-khai" || cemeterySlug === "quang_khai";
  const isQuangPhuc = cemeterySlug === "quang-phuc" || cemeterySlug === "quang_phuc";

  const locality = isTuKy ? "Xã Tứ Kỳ" : isMinhDuc ? "Xã Minh Đức" : isQuangKhai ? "Xã Quang Khải" : isQuangPhuc ? "Xã Quang Phục" : "Huyện Tứ Kỳ";
  const count = isTuKy ? 216 : isMinhDuc ? 332 : isQuangKhai ? 267 : isQuangPhuc ? 200 : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": cemeteryName || "Nghĩa trang liệt sĩ xã Tứ Kỳ",
    "description": `Bản đồ số và thông tin tra cứu phần mộ Anh hùng Liệt sĩ tại ${cemeteryName || "Nghĩa trang liệt sĩ xã Tứ Kỳ"}, huyện Tứ Kỳ, tỉnh Hải Dương.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locality,
      "addressRegion": "Hải Dương",
      "addressCountry": "VN"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Số lượng phần mộ",
        "value": count
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <CemeteryClient 
          initialCemeterySlug={cemeterySlug} 
          initialMartyrs={martyrs} 
        />
      </Suspense>
    </>
  );
}
