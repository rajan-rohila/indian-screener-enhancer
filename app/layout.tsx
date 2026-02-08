import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Screener Industry Filter",
  description: "Industry filter for Screener.in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={notoSans.variable}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "var(--font-noto-sans), 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                colorPrimary: '#1677ff',
                borderRadius: 6,
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
