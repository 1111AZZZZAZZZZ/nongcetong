import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. 视口配置：确保在移动端不会因为缩放导致布局崩坏
export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "农策通 - 智能指挥中枢",
  description: "基于 RAG 与多模态 AI 的现代农业管理平台",
  manifest: "/manifest.json",
  // 2. 针对 iOS 的特别加固
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 改为透明，更有 App 感
    title: "农策通",
  },
  // 3. 强制告诉浏览器不要缓存 Manifest 报错
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning> 
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}