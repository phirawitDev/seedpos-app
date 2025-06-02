import type { Metadata } from "next";
import "./globals.css";

import { Sarabun } from "next/font/google";

const prompt = Sarabun({
  subsets: ["thai"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "POS | ทิพย์รุ่งโรจน์การเกษตร",
  description: "ระบบขายเมล็ดพันธุ์ ทิพย์รุ่งโรจน์การเกษตร",
  icons: {
    icon: "/img/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={prompt.className}>
      <body className="body">{children}</body>
    </html>
  );
}
