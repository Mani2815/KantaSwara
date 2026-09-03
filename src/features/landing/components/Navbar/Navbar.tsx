'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, LayoutGrid, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/common/Logo';
import styles from './Navbar.module.css';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { label: 'Solutions', href: '#industries' },
  { label: 'Platform', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '/docs' },
];

function GlassFilter() {
  return (
    <svg style={{ display: 'none' }}>
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(NAV_LINKS[0].label);
  const router = useRouter();
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        setIsScrollingUp(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsScrollingUp(true);
      }
      
      setScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showTopBar = !scrolled || isScrollingUp;

  return (
    <>
      {/* Top Utility Bar */}
      <div 
        className={cn(
          "hidden md:flex w-full bg-[#111111] border-b border-[#222222] text-[13px] font-medium text-gray-400 py-1.5 px-8 justify-end items-center gap-6 fixed top-0 left-0 right-0 z-[9999] h-[32px] transition-transform duration-300", 
          !showTopBar && "-translate-y-full"
        )}
      >
        <Link href="/docs" className="text-[#ff5500] hover:text-[#ff7733] transition-colors">Docs</Link>
        <Link href="/support" className="text-[#ff5500] hover:text-[#ff7733] transition-colors">Support</Link>
        <Link href="/blog" className="text-[#ff5500] hover:text-[#ff7733] transition-colors">Blog</Link>
        
        <div className="relative group h-full flex items-center">
          <button className="flex items-center gap-1 text-[#ff5500] hover:text-[#ff7733] transition-colors py-2">
            All logins <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform" />
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-[10000]">
            <div className="w-72 bg-[#1c1c1c] rounded-xl shadow-2xl border border-[#2a2a2a]">
              <div className="p-3 flex flex-col gap-1">
                {/* Console */}
                <Link href="/console/login" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md border border-[#333333] bg-[#222222] text-gray-300 shrink-0">
                    <LayoutGrid size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-white">Organization Portal</span>
                    <span className="text-[13px] text-gray-400">console.kantaswara.ai</span>
                  </div>
                </Link>

                {/* Delivery Console */}
                <Link href="/console/login" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md border border-[#333333] bg-[#222222] text-gray-300 shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-white">Delivery Console</span>
                    <span className="text-[13px] text-gray-400">delivery.kantaswara.ai</span>
                  </div>
                </Link>

                {/* Super Admin */}
                <Link href="/console/login" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md border border-[#333333] bg-[#222222] text-gray-300 shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-white">Super Admin</span>
                    <span className="text-[13px] text-gray-400">admin.kantaswara.ai</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className={cn(
        styles.navbar, 
        scrolled && styles['navbar--scrolled'],
        !showTopBar && styles['navbar--hide-top-bar']
      )}>
        <div className={styles.navbar__inner}>
          <div className={styles['navbar__inner-glass']} />
          <Link href="/" className={styles.navbar__logo}>
            <Logo className="h-10 md:h-11 w-auto text-[#ff5500]" />
          </Link>

          <div className={styles['navbar__nav-wrapper']}>
            <nav className={styles.navbar__nav} aria-label="Main navigation">
              {NAV_LINKS.map((link) => {
                const isActive = activeTab === link.label;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setActiveTab(link.label)}
                    className={cn(
                      styles.navbar__link,
                      isActive && styles['navbar__link--active']
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-lamp"
                        className={styles['lamp-wrapper']}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <div className={styles.lamp}>
                          <div className={styles['lamp__glow-1']} />
                          <div className={styles['lamp__glow-2']} />
                          <div className={styles['lamp__glow-3']} />
                        </div>
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={styles.navbar__actions}>
            <Button variant="ghost" size="sm">
              <Link href="/login">Log In</Link>
            </Button>
            <Button 
              variant="cta" 
              size="sm" 
              style={{ borderRadius: '9999px' }}
              onClick={() => router.push('/register')}
            >
              Get started
            </Button>
          </div>

          <button
            className={styles.navbar__toggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          styles['navbar__mobile-menu'],
          mobileOpen && styles['navbar__mobile-menu--open']
        )}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={styles['navbar__mobile-link']}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <Button 
          variant="cta" 
          size="lg" 
          style={{ marginTop: 'var(--space-4)', borderRadius: '9999px' }}
          onClick={() => {
            setMobileOpen(false);
            router.push('/register');
          }}
        >
          Get started
        </Button>
      </div>
      <GlassFilter />
    </>
  );
}
