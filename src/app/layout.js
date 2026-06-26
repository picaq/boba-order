import { Lora, Nunito } from 'next/font/google';
import './globals.css';

const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });

export const metadata = {
  title: 'Boba Order 🧋',
  description: 'Order your favorite boba drinks by voice',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
