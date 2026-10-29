'use client';

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
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
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
        sectionId: 'mekanisme',
        label: 'Sourcing Kolektif',
        desc: 'Mekanisme pooling kuota pasokan & proteksi escrow',
        icon: Users,
      },
      {
        href: '/paket-layanan',
        sectionId: 'biaya',
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
        label: 'Prediksi Harga Pasok',
        desc: 'Prakiraan tren harga bahan pangan DIY berbasis Machine Learning',
        icon: TrendingUp,
      },
      {
        href: '/tentang',
        sectionId: 'cerita',
        label: 'Kisah & Misi Sourcing',
        desc: 'Menghubungkan dapur kuliner ke supplier pangan lokal DIY',
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
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        e.preventDefault();
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        router.push(`/?section=${sectionId}`);
        return;
      }
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
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

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <>

      <motion.header suppressHydrationWarning
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3.5 sm:pt-4 pb-2 pointer-events-none"
      >
        <div
          ref={dropdownRef}
          className={`max-w-7xl mx-auto rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto transition-all duration-200 bg-white border ${
            isScrolled
              ? 'shadow-md border-netral-border'
              : 'shadow-sm border-netral-border/80'
          }`}
        >
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-primer rounded-full py-1 pr-2 group"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/icons/icon.svg"
                alt="Logo PasokMataram"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-heading font-extrabold text-lg text-gelap tracking-tight group-hover:text-primer transition-colors">
              Pasok<span className="text-primer">Mataram</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gelap/85" aria-label="Navigasi Utama">
            <Link
              href="/"
              className="hover:text-primer transition-colors focus-visible:ring-2 focus-visible:ring-primer rounded-full py-2 px-3.5 text-gelap/80 hover:bg-primer-light/40"
            >
              Beranda
            </Link>
            {NAV_GROUPS.map((group) => {
              const isOpen = activeDropdown === group.id;
              return (
                <div key={group.id} className="relative">
                  <button
                    type="button"
                    onClick={() => handleDropdownToggle(group.id)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={`inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs sm:text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primer min-h-[44px] ${
                      isOpen
                        ? 'text-primer bg-primer-light/70 font-bold shadow-2xs'
                        : 'text-gelap/80 hover:text-primer hover:bg-primer-light/40'
                    }`}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primer' : 'text-gelap/50'
                      }`}
                    />
                  </button>

                  <div
                    id={`nav-dropdown-${group.id}`}
                    role="menu"
                    className={`absolute top-full left-0 mt-3 w-80 sm:w-84 bg-white rounded-2xl border border-netral-border/90 shadow-xl p-2.5 z-50 overflow-hidden transition-all duration-200 origin-top ${
                      isOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const IconComponent = item.icon || Truck;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            role="menuitem"
                            onClick={(e) => handleScrollToSection(e, item.sectionId, item.href)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primer-light/40 transition-colors group/item focus-visible:ring-2 focus-visible:ring-primer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primer-light text-primer flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-primer group-hover/item:text-white transition-colors">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-heading font-bold text-xs text-gelap group-hover/item:text-primer transition-colors flex items-center justify-between">
                                <span>{item.label}</span>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-primer" />
                              </div>
                              {item.desc && (
                                <p className="text-[11px] text-gelap/65 leading-snug mt-0.5 font-normal">
                                  {item.desc}
                                </p>
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

          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-gelap/85 hover:text-primer hover:bg-netral-canvas transition-colors focus-visible:ring-2 focus-visible:ring-primer rounded-full py-2 px-3.5 min-h-[44px] flex items-center"
            >
              Masuk Portal
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-bold font-heading rounded-full bg-primer text-white hover:bg-primer-hover shadow-xs hover:shadow-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
            >
              Daftar Kemitraan
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            className="lg:hidden p-2 rounded-full text-gelap hover:bg-netral-canvas focus-visible:ring-2 focus-visible:ring-primer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gelap" /> : <Menu className="w-5 h-5 text-gelap" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-gelap/60"
              aria-hidden="true"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 bg-white rounded-t-3xl shadow-2xl border-t border-netral-border max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={(e) => {
                    handleScrollToTop(e);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2.5"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <Image
                      src="/icons/icon.svg"
                      alt="Logo PasokMataram"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-heading font-extrabold text-base text-gelap tracking-tight">
                    Pasok<span className="text-primer">Mataram</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Tutup menu navigasi"
                  className="p-2 rounded-full text-gelap/60 hover:text-gelap hover:bg-netral-canvas min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 flex-1">
                <Link
                  href="/"
                  onClick={(e) => {
                    handleScrollToTop(e);
                    setMobileMenuOpen(false);
                  }}
                  className="block p-3 rounded-xl bg-netral-canvas/60 font-heading font-bold text-xs text-gelap hover:bg-netral-canvas transition-colors min-h-[44px] flex items-center"
                >
                  Beranda
                </Link>

                {NAV_GROUPS.map((group) => {
                  const isExpanded = expandedMobileGroup === group.id;
                  return (
                    <div key={group.id} className="border border-netral-border/70 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleMobileGroupToggle(group.id)}
                        className="w-full p-3.5 flex items-center justify-between text-left font-heading font-bold text-xs text-gelap bg-white hover:bg-netral-canvas transition-colors min-h-[44px]"
                      >
                        <span>{group.title}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-gelap/50 transition-transform ${
                            isExpanded ? 'rotate-180 text-primer' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="bg-netral-canvas/40 p-2 space-y-1 border-t border-netral-border/50">
                          {group.items.map((item) => {
                            const IconComponent = item.icon || Truck;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={(e) => handleScrollToSection(e, item.sectionId, item.href)}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white text-xs text-gelap/90 transition-colors min-h-[44px]"
                              >
                                <div className="w-7 h-7 rounded-lg bg-primer-light text-primer flex items-center justify-center shrink-0">
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-xs text-gelap truncate">{item.label}</div>
                                  {item.desc && (
                                    <div className="text-[10px] text-gelap/60 truncate">{item.desc}</div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-netral-border/70 bg-netral-canvas/30 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold font-heading rounded-full bg-white border border-netral-border text-gelap hover:bg-netral-surface min-h-[44px]"
                >
                  Masuk Portal
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold font-heading rounded-full bg-primer text-white hover:bg-primer-hover min-h-[44px]"
                >
                  Daftar Kemitraan
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
