import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '安安的奇妙旅行',
  description: '跟随安安进入像素世界，开始一场奇妙旅行。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
