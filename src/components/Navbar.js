'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiShoppingCart, FiMenu, FiX, FiZap, FiUser, FiLogOut, FiSettings, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { user, profile, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const links = [
    { href: '/', label: 'হোম' },
    { href: '/products', label: 'প্রোডাক্ট' },
  ];

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <nav className="navbar" style={scrolled ? { boxShadow: '0 4px 30px rgba(0,0,0,0.3)' } : {}}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <FiZap />
          ইলেকট্রিক শপ
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <Link href="/cart" className="navbar-cart" id="nav-cart-btn">
            <FiShoppingCart />
            {totalItems > 0 && <span className="navbar-cart-count">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="navbar-user-menu" ref={dropdownRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="nav-user-btn"
              >
                <div className="navbar-avatar">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-user-name">{profile?.full_name || user.email.split('@')[0]}</span>
                <FiChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <strong>{profile?.full_name || 'ইউজার'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link href="/profile" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser size={14} /> প্রোফাইল
                  </Link>
                  <Link href="/orders" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiShoppingBag size={14} /> আমার অর্ডার
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiSettings size={14} /> অ্যাডমিন প্যানেল
                    </Link>
                  )}
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <FiLogOut size={14} /> লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary btn-sm" id="nav-login-btn">
              <FiUser size={14} />
              লগইন
            </Link>
          )}

          <button
            className="navbar-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
