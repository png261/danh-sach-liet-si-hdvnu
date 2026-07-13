import type { Metadata } from "next";
import { Be_Vietnam_Pro, Merriweather } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-primary",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif-family",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://danh-sach-liet-si-hdvnu.vercel.app"),
  title: {
    default: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ",
    template: "%s | Cổng Tra Cứu"
  },
  description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội.",
  openGraph: {
    title: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ",
    description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện Hải Dương tại Đại học Quốc gia Hà Nội.",
    siteName: "Nghĩa trang xã Tứ Kỳ",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ",
    description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${merriweather.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
