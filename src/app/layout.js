import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  metadataBase: new URL('https://electric-shop-bd.netlify.app'),
  title: 'ইলেকট্রিক শপ - বাংলাদেশের সেরা ইলেকট্রনিক্স স্টোর',
  description: 'সেরা মানের মোবাইল, ল্যাপটপ, হেডফোন, ক্যামেরা ও গেমিং পণ্য সবচেয়ে কম দামে। ১০০% অরিজিনাল গ্যারান্টি।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '60vh' }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
