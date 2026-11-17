import './globals.css';

export const metadata = {
  title: 'وردية - تشغيل وحجز ورديات العمالة',
  description: 'احجز ورديتك اليومية واستلم مستحقاتك بكل سهولة',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#16a34a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-slate-100 text-slate-900 antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-['Cairo',sans-serif] bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
