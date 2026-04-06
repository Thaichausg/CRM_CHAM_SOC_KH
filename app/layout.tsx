import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["vietnamese", "latin"] });

export const metadata: Metadata = {
  title: "CRM Chăm Sóc Khách Hàng",
  description: "Hệ thống quản lý và chăm sóc khách hàng chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
