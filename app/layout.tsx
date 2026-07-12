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
    default: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Huyện Tứ Kỳ",
    template: "%s | Cổng Tra Cứu"
  },
  description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn huyện Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện đồng hương Hải Dương tại Đại học Quốc gia Hà Nội.",
  openGraph: {
    title: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Huyện Tứ Kỳ",
    description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn huyện Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện đồng hương Hải Dương tại Đại học Quốc gia Hà Nội.",
    siteName: "Nghĩa trang huyện Tứ Kỳ",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cổng Tra Cứu Phần Mộ Liệt Sĩ Huyện Tứ Kỳ",
    description: "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn huyện Tứ Kỳ, tỉnh Hải Dương.",
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
