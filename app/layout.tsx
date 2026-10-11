import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Expert Review - Xóa Review Tiêu Cực | Seeding 5 Sao | Tăng Đánh Giá Google Maps",
  description: "Dịch vụ xóa đánh giá tiêu cực, seeding review 5 sao, tăng đánh giá Google Maps. Xử lý 1-2 ngày, bảo hành 30 ngày, thanh toán sau khi hoàn thành.",
  keywords: ["xóa review tiêu cực", "seeding review 5 sao", "tăng đánh giá google maps", "expert review"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}