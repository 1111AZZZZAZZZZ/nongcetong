import type { Metadata } from "next";
import "./globals.css";

// 💡 提示：已经去除了 next/font/google 的引入和变量声明，彻底规避底层的依赖报错

export const metadata: Metadata = {
  title: "农策通 | 智能农业控制中枢",
  description: "基于大模型的智能农业专家决策与物联网控制系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}