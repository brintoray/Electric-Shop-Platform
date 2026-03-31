'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiTag, FiSettings, FiBarChart2 } from 'react-icons/fi';

const sidebarLinks = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: <FiGrid /> },
  { href: '/admin/products', label: 'প্রোডাক্ট', icon: <FiBox /> },
  { href: '/admin/orders', label: 'অর্ডার', icon: <FiShoppingBag /> },
  { href: '/admin/customers', label: 'গ্রাহক', icon: <FiUsers /> },
  { href: '/admin/categories', label: 'ক্যাটাগরি', icon: <FiTag /> },
  { href: '/admin/reports', label: 'রিপোর্ট', icon: <FiBarChart2 /> },
  { href: '/admin/settings', label: 'সেটিংস', icon: <FiSettings /> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">অ্যাডমিন প্যানেল</div>
        {sidebarLinks.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
            {link.icon} {link.label}
          </Link>
        ))}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
