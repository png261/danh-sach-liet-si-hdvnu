import { Suspense } from "react";
import CemeteryClient from "./CemeteryClient";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ",
    "description": "Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương. Được xây dựng bởi Đoàn xã Tứ Kỳ và Đội SVTN Hải Dương tại ĐHQGHN.",
    "provider": {
      "@type": "GovernmentOrganization",
      "name": "Đoàn xã Tứ Kỳ"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Xã Tứ Kỳ, huyện Tứ Kỳ, tỉnh Hải Dương"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <CemeteryClient />
      </Suspense>
    </>
  );
}
