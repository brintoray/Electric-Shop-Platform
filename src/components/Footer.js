import Link from 'next/link';
import { FiZap } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiZap /> ইলেকট্রিক শপ
            </div>
            <p className="footer-desc">
              বাংলাদেশের সেরা ইলেকট্রনিক্স শপ। আমরা সরবরাহ করি সেরা মানের ইলেকট্রনিক পণ্য সবচেয়ে কম দামে। ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি।
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
              <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">দ্রুত লিংক</h4>
            <div className="footer-links">
              <Link href="/products">সব প্রোডাক্ট</Link>
              <Link href="/categories">ক্যাটাগরি</Link>
              <Link href="/about">আমাদের সম্পর্কে</Link>
              <Link href="/contact">যোগাযোগ</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">ক্যাটাগরি</h4>
            <div className="footer-links">
              <Link href="/products?category=mobile">মোবাইল ফোন</Link>
              <Link href="/products?category=laptop">ল্যাপটপ</Link>
              <Link href="/products?category=headphone">হেডফোন</Link>
              <Link href="/products?category=camera">ক্যামেরা</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">সাহায্য</h4>
            <div className="footer-links">
              <Link href="/faq">সচরাচর জিজ্ঞাসা</Link>
              <Link href="/shipping">শিপিং নীতি</Link>
              <Link href="/returns">রিটার্ন পলিসি</Link>
              <Link href="/privacy">গোপনীয়তা নীতি</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ইলেকট্রিক শপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>💳 বিকাশ | নগদ | রকেট | কার্ড পেমেন্ট</p>
        </div>
      </div>
    </footer>
  );
}
