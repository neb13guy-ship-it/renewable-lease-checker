import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 기본 글꼴: Inter (한글은 아래 globals.css의 한글 글꼴 순서를 따른다)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "대부 가능 여부 판별기",
  description: "업무지침에 따라 신재생에너지 발전시설의 국유지 대부 가능 여부를 1차 확인합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
