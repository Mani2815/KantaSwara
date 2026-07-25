import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import styles from './Footer.module.css';

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__inner}>
        <div className={styles.footer__grid}>
          
          <div className={styles.footer__brand}>
            <Link href="/" aria-label="KantaSwara Home">
              <Logo className="h-10 md:h-12 w-auto text-[#ff6600]" />
            </Link>
            <p className={styles.footer__description}>
              Enterprise AI voice agents built to execute complex business workflows. 
              Deploy digital employees that convert inquiries into outcomes.
            </p>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__heading}>Platform</h4>
            <div className={styles.footer__links}>
              <Link href="#how-it-works" className={styles.footer__link}>How It Works</Link>
              <Link href="/security" className={styles.footer__link}>Security & Trust</Link>
              <Link href="#pricing" className={styles.footer__link}>Pricing</Link>
            </div>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__heading}>Solutions</h4>
            <div className={styles.footer__links}>
              <Link href="#industries" className={styles.footer__link}>Real Estate</Link>
              <Link href="#industries" className={styles.footer__link}>EdTech</Link>
              <Link href="#industries" className={styles.footer__link}>Automobile</Link>
              <Link href="/custom" className={styles.footer__link}>Custom Workflows</Link>
            </div>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__heading}>Company</h4>
            <div className={styles.footer__links}>
              <Link href="/about" className={styles.footer__link}>About Us</Link>
              <Link href="/blog" className={styles.footer__link}>Blog</Link>
              <Link href="/careers" className={styles.footer__link}>Careers</Link>
              <Link href="/contact" className={styles.footer__link}>Contact Sales</Link>
            </div>
          </div>

        </div>

        <div className={styles.footer__bottom}>
          <p className={styles.footer__copyright}>
            © {new Date().getFullYear()} KantaSwara. All rights reserved.
          </p>
          <div className={styles.footer__socials}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.footer__social_link}>
              <TwitterIcon size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.footer__social_link}>
              <LinkedinIcon size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.footer__social_link}>
              <GithubIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
