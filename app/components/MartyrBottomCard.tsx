"use client";

import { Volume2, VolumeX, Loader2, Share2 } from "lucide-react";
import type { Martyr } from "@/app/types/martyr";
import { getPhysicalZone } from "@/app/lib/martyrUtils";
import { useMartyrTTS } from "@/app/hooks/useMartyrTTS";
import { Drawer } from "vaul";
import Equalizer from "@/app/components/Equalizer";

interface MartyrBottomCardProps {
  open: boolean;
  martyr: Martyr;
  onClose: () => void;
  onOpenFullModal: () => void;
  onOpenShareModal: () => void;
  onLocate: (martyr: Martyr) => void;
}

export default function MartyrBottomCard({
  open,
  martyr,
  onClose,
  onOpenFullModal,
  onOpenShareModal,
  onLocate,
}: MartyrBottomCardProps) {
  const { isSpeaking, isLoading, handleSpeak } = useMartyrTTS(martyr);
  const zone = getPhysicalZone(martyr);

  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      // Kéo xuống < 40% thì snap về lại, > 40% thì đóng
      snapPoints={[1]}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="martyr-bottom-card"
          aria-label="Thông tin liệt sĩ được chọn"
          // Vaul thêm sẵn role="dialog" — ghi đè để tránh conflict với modal chính
          role="complementary"
        >
          {/* Thanh kéo — vaul tự xử lý drag-to-dismiss */}
          <div className="bottom-card-handle" />

          <div className="bottom-card-inner">

            {/* ── Thông tin liệt sĩ ── */}
            <div className="bottom-card-info">
              <div className="bottom-card-name">{martyr.name}</div>

              <div className="bottom-card-location">
                Vị trí:&nbsp;
                <strong>Khu {zone}</strong>
                {martyr.row_no   && <>, Hàng {martyr.row_no}</>}
                {martyr.grave_no && <>, Mộ {martyr.grave_no}</>}
                &nbsp;—&nbsp;{martyr.cemetery}
              </div>

              {(martyr.birth_year || martyr.rank) && (
                <div className="bottom-card-meta">
                  {martyr.birth_year && <span>Năm sinh: <strong>{martyr.birth_year}</strong></span>}
                  {martyr.birth_year && martyr.rank && <span className="bottom-card-meta-dot">·</span>}
                  {martyr.rank && <span>{martyr.rank}</span>}
                </div>
              )}
            </div>

            {/* ── Các nút thao tác ── */}
            <div className="bottom-card-actions">

              <button
                className={`bottom-card-btn bottom-card-btn-speak${isSpeaking ? " speaking" : ""}`}
                onClick={handleSpeak}
                disabled={isLoading}
                aria-label={isSpeaking ? "Dừng đọc tiểu sử" : "Nghe tiểu sử liệt sĩ"}
              >
                {isLoading ? (
                  <Loader2 size={18} className="bottom-card-btn-spin" />
                ) : isSpeaking ? (
                  <Equalizer size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              <button
                className="bottom-card-btn bottom-card-btn-speak"
                onClick={onOpenShareModal}
                aria-label="Chia sẻ thông tin và tải ảnh tri ân"
                style={{ width: "44px", minWidth: "44px", padding: 0, justifyContent: "center", flexShrink: 0 }}
              >
                <Share2 size={18} />
              </button>

              <button
                className="bottom-card-btn bottom-card-btn-detail"
                onClick={onOpenFullModal}
                aria-label="Xem tiểu sử đầy đủ của liệt sĩ"
              >
                Xem tiểu sử đầy đủ
              </button>

              <button
                className="bottom-card-btn bottom-card-btn-close"
                onClick={onClose}
                aria-label="Đóng bảng thông tin nhanh"
              >
                Đóng
              </button>

            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
