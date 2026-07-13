import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Cổng Tra Cứu Phần Mộ Liệt Sĩ Xã Tứ Kỳ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Read local fonts for server-side image rendering
  const beVietnamProRegular = readFileSync(join(process.cwd(), "public/fonts/BeVietnamPro-Regular.ttf"));
  const beVietnamProBold = readFileSync(join(process.cwd(), "public/fonts/BeVietnamPro-Bold.ttf"));
  const merriweatherBold = readFileSync(join(process.cwd(), "public/fonts/Merriweather-Bold.ttf"));

  // Read logos and convert to base64 Data URLs so they render reliably offline/during build
  // Note: Satori (ImageResponse) requires PNG, not WebP — _og.png files are dedicated copies
  const svtnLogoBase64 = readFileSync(join(process.cwd(), "public/logo_svtn_og.png")).toString("base64");
  const doanXaLogoBase64 = readFileSync(join(process.cwd(), "public/logo_doan_xa_og.png")).toString("base64");

  const svtnLogoUrl = `data:image/png;base64,${svtnLogoBase64}`;
  const doanXaLogoUrl = `data:image/png;base64,${doanXaLogoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAF8F2", // Warm Giấy Dó background
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Outer card border */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            bottom: "20px",
            border: "2px solid #EADFCE",
            display: "flex",
          }}
        />
        {/* Inner thin gold border */}
        <div
          style={{
            position: "absolute",
            top: "26px",
            left: "26px",
            right: "26px",
            bottom: "26px",
            border: "1px solid #A47B2E",
            display: "flex",
          }}
        />

        {/* Content Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Symmetrical logos */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "20px",
            }}
          >
            <img
              src={svtnLogoUrl}
              style={{ width: 90, height: 90, objectFit: "contain" }}
              alt="Logo SVTN"
            />
            <img
              src={doanXaLogoUrl}
              style={{ width: 90, height: 90, objectFit: "contain" }}
              alt="Logo Doan Xa"
            />
          </div>

          {/* Golden gradient divider */}
          <div
            style={{
              width: "180px",
              height: "3px",
              background: "linear-gradient(90deg, transparent, #A47B2E, transparent)",
              marginBottom: "24px",
              display: "flex",
            }}
          />

          {/* Main Title (Merriweather Serif) */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              fontFamily: "Merriweather",
              color: "#9B1C26", // var(--primary-red)
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            CỔNG TRA CỨU THÔNG TIN LIỆT SĨ
          </div>

          {/* Subtitle / Description Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            {/* Dong Son Star Motif SVG */}
            <svg
              viewBox="0 0 100 100"
              width="64"
              height="64"
              style={{ color: "#A47B2E", marginBottom: "16px", display: "flex" }}
            >
              <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
              <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1" />
              <path
                d="M 50 16 L 53 34 L 70 24 L 59 39 L 80 43 L 62 48 L 74 66 L 56 53 L 59 74 L 48 57 L 38 74 L 42 53 L 24 66 L 36 48 L 18 43 L 39 39 L 28 24 L 45 34 Z"
                fill="currentColor"
              />
              <path d="M 50 6 A 44 44 0 0 1 94 50" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6,8" strokeLinecap="round" />
              <path d="M 50 94 A 44 44 0 0 1 6 50"  fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6,8" strokeLinecap="round" />
            </svg>

            {/* Portal Context */}
            <div
              style={{
                fontSize: "20px",
                fontFamily: "Be Vietnam Pro",
                fontWeight: "bold",
                color: "#2D2722", // foreground
                textAlign: "center",
                marginBottom: "6px",
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              CÁC NGHĨA TRANG LIỆT SĨ XÃ TỨ KỲ
            </div>

            {/* Support/Descriptions */}
            <div
              style={{
                fontSize: "15px",
                fontFamily: "Be Vietnam Pro",
                color: "#5F564F", // text-muted
                textAlign: "center",
                maxWidth: "680px",
                lineHeight: 1.4,
                display: "flex",
              }}
            >
              Cổng tra cứu thông tin phần mộ và tiểu sử Anh hùng Liệt sĩ tại các nghĩa trang liệt sĩ trên địa bàn xã Tứ Kỳ, tỉnh Hải Dương. Thực hiện bởi Đoàn xã Tứ Kỳ và Đội Sinh viên tình nguyện Hải Dương.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Be Vietnam Pro",
          data: beVietnamProRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Be Vietnam Pro",
          data: beVietnamProBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Merriweather",
          data: merriweatherBold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
