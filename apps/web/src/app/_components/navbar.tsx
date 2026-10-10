'use client';

/**
 * @file src/app/_components/navbar.tsx
 * @description Navbar responsif PasokMataram dengan sistem Grouping Dropdown accessible (WCAG 2.1 AA)
 * dan mobile drawer accordion. Menggunakan rute App Router semantik tanpa anchor hash.
 * Mematuhi prinsip antislop-layoutmobile (R-03, tap target >= 44px) & antislop-human (keyboard a11y).
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Truck,
  CheckCircle2,
  MapPin,
  Calculator,
  Users,
  CreditCard,
  HeartHandshake,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  desc?: string;
  icon?: React.ElementType;
  sectionId?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'layanan',
    title: 'Layanan Dapur',
    items: [
      {
        href: '/alur-pengadaan',
        sectionId: 'alur-pengadaan',
        label: 'Alur Pengadaan Dapur',
        desc: 'Standing order rutin & pengiriman subuh terjadwal',
        icon: Truck,
      },
      {
        href: '/alur-pengadaan',
        sectionId: 'solusi',
        label: 'Standar Mutu & Transit',
        desc: 'Sortir grade A & uji petik mutu di Hub Bantul',
        icon: CheckCircle2,
      },
      {
        href: '/komoditas',
        sectionId: 'komoditas',
        label: 'Sentra Panen DIY',
        desc: 'Katalog langsung Kulon Progo, Bantul, dan Sleman',
        icon: MapPin,
      },
    ],
  },
  {
    id: 'skema',
    title: 'Skema & Biaya',
    items: [
      {
        href: '/kalkulator',
        sectionId: 'kalkulator',
        label: 'Kalkulator Penghematan',
        desc: 'Simulasi efisiensi belanja dapur vs pasar harian',
        icon: Calculator,
      },
      {
        href: '/mekanisme',
        sectionId: 'pooling',
        label: 'Sourcing Kolektif',
        desc: 'Mekanisme pooling kuota panen & proteksi escrow',
        icon: Users,
      },
      {
        href: '/paket-b2b',
        sectionId: 'paket',
        label: 'Paket Layanan Dapur',
        desc: 'Pilihan paket transparan dapur mandiri & multi-outlet',
        icon: CreditCard,
      },
    ],
  },
  {
    id: 'tentang',
    title: 'Tentang Platform',
    items: [
      {
        href: '/prediksi-harga',
        label: 'Prediksi Harga AI',
        desc: 'Prakiraan tren harga komoditas DIY berbasis Machine Learning',
        icon: TrendingUp,
      },
      {
        href: '/tentang',
        sectionId: 'misi',
        label: 'Kisah & Misi Sourcing',
        desc: 'Menghubungkan dapur kuliner langsung ke petani lokal',
        icon: HeartHandshake,
      },
      {
        href: '/faq',
        sectionId: 'faq',
        label: 'Tanya Jawab Operasional',
        desc: 'Jawaban lengkap seputar SOP, retur QC, dan escrow',
        icon: HelpCircle,
      },
    ],
  },
];

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>('layanan');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const handleMobileGroupToggle = (id: string) => {
    setExpandedMobileGroup((prev) => (prev === id ? null : id));
  };

  /**
   * Menggulir halus ke seksi sasaran di halaman landing page tanpa menyisipkan hash # di URL.
   */
  const handleScrollToSection = (e: React.MouseEvent, sectionId?: string, fallbackHref?: string) => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        e.preventDefault();
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        el.scrollIntoView({ behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }
        return;
      }
    }
    if (sectionId && typeof window !== 'undefined' && window.location.pathname !== '/') {
      e.preventDefault();
      setActiveDropdown(null);
      setMobileMenuOpen(false);
      router.push(`/?section=${sectionId}`);
    }
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      setActiveDropdown(null);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div
        ref={dropdownRef}
        className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-netral-border/70 rounded-full px-5 py-2.5 shadow-sm flex items-center justify-between"
      >
        <Link
          href="/"
          onClick={handleScrollToTop}
          className="flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-primer rounded-full py-1 pr-2"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primer/10 flex items-center justify-center p-0.5 shadow-sm border border-primer/20">
            <Image
              src="/icons/icon.svg"
              alt="Logo PasokMataram"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-heading font-extrabold text-lg text-gelap tracking-tight">
            Pasok<span className="text-primer">Mataram</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-3 text-xs font-semibold text-gelap/85" aria-label="Navigasi Utama">
          <Link
            href="/"
            className="hover:text-primer transition-colors focus-visible:ring-2 focus-visible:ring-primer rounded-full py-2 px-3 text-gelap/80 hover:bg-netral-canvas"
          >
            Beranda
          </Link>

          {NAV_GROUPS.map((group) => {
            const isGroupOpen = activeDropdown === group.id;

            return (
              <div key={group.id} className="relative">
                <button
                  type="button"
                  id={`nav-button-${group.id}`}
                  aria-expanded={isGroupOpen}
                  aria-haspopup="true"
                  aria-controls={`nav-dropdown-${group.id}`}
                  onClick={() => handleDropdownToggle(group.id)}
                  className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primer ${
                    isGroupOpen
                      ? 'bg-netral-canvas text-primer font-bold'
                      : 'hover:text-primer hover:bg-netral-canvas/80'
                  }`}
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isGroupOpen ? 'rotate-180 text-primer' : 'text-gelap/50'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`nav-dropdown-${group.id}`}
                  role="menu"
                  aria-labelledby={`nav-button-${group.id}`}
                  className={`absolute top-full left-0 mt-2.5 w-72 bg-white rounded-2xl border border-netral-border/80 shadow-xl p-2 z-50 overflow-hidden transition-all duration-200 ${
                    isGroupOpen
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconComponent = item.icon || ChevronRight;
                      return (
                        <Link
                          key={`${group.id}-${item.label}`}
                          href={item.href}
                          role="menuitem"
                          onClick={(e) => handleScrollToSection(e, item.sectionId, item.href)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-netral-canvas/70 transition-colors group/item focus-visible:ring-2 focus-visible:ring-primer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-netral-canvas flex items-center justify-center text-primer flex-shrink-0 group-hover/item:bg-primer group-hover/item:text-white transition-colors">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-bold text-gelap group-hover/item:text-primer transition-colors">
                              {item.label}
                            </span>
                            {item.desc && (
                              <span className="block text-[11px] text-gelap/60 font-normal leading-tight mt-0.5">
                                {item.desc}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center space-x-2">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primer min-h-[44px]"
          >
            Daftar Kemitraan
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka menu navigasi'}
            className="w-11 h-11 flex items-center justify-center rounded-full text-gelap hover:text-primer hover:bg-netral-canvas transition-colors focus-visible:ring-2 focus-visible:ring-primer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden max-w-7xl mx-auto mt-2 bg-white border border-netral-border/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-3"
          >
            <Link
              href="/"
              onClick={(e) => {
                handleScrollToTop(e);
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-sm font-semibold text-gelap hover:text-primer hover:bg-netral-canvas rounded-lg min-h-[44px] flex items-center"
            >
              Beranda
            </Link>

            <div className="space-y-1.5 border-t border-netral-border/50 pt-2">
              {NAV_GROUPS.map((group) => {
                const isGroupExpanded = expandedMobileGroup === group.id;

                return (
                  <div key={group.id} className="border border-netral-border/60 rounded-xl overflow-hidden bg-netral-canvas/20">
                    <button
                      type="button"
                      onClick={() => handleMobileGroupToggle(group.id)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-gelap hover:text-primer min-h-[44px] transition-colors"
                      aria-expanded={isGroupExpanded}
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gelap/60 transition-transform duration-200 ${
                          isGroupExpanded ? 'rotate-180 text-primer' : ''
                        }`}
                      />
                    </button>

                    {isGroupExpanded && (
                      <div className="px-2 pb-2 space-y-1 bg-white/70">
                        {group.items.map((item) => {
                          const IconComp = item.icon || ChevronRight;
                          return (
                            <Link
                              key={`mobile-${group.id}-${item.label}`}
                              href={item.href}
                              onClick={(e) => handleScrollToSection(e, item.sectionId, item.href)}
                              className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-gelap/80 hover:text-primer hover:bg-netral-canvas transition-colors min-h-[44px]"
                            >
                              <IconComp className="w-3.5 h-3.5 text-primer flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-netral-border/60">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center py-3 text-xs font-bold rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-colors min-h-[44px]"
              >
                Daftar Kemitraan (HoReKa & Gapoktan)
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
