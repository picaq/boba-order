import { Kurale, Laila } from 'next/font/google';
import './globals.css';

const kurale = Kurale({ weight: '400', subsets: ['latin'], variable: '--font-kurale', display: 'swap' });
const laila = Laila({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-laila', display: 'swap' });

export const metadata = {
  title: 'Boba Order 🧋',
  description: 'Order your favorite boba drinks by voice',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${kurale.variable} ${laila.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
