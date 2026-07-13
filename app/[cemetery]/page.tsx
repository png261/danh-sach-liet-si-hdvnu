import type { Metadata } from "next";
import CemeteryClient from "../CemeteryClient";

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

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const cemeterySlug = resolvedParams.cemetery;
  return <CemeteryClient initialCemeterySlug={cemeterySlug} />;
}
