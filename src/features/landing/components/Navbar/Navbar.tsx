'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(NAV_LINKS[0].label);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={cn(styles.navbar, scrolled && styles['navbar--scrolled'])}>
        <div className={styles.navbar__inner}>
          <div className={styles['navbar__inner-glass']} />
          <Link href="/" className={styles.navbar__logo}>
            <Logo className="h-10 md:h-11 w-auto text-[#ff6600]" />
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
