'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2, Shield, BarChart2,
  Users, FileText, Layers, Lock, Zap, Server,
  HeadphonesIcon, GitBranch
} from 'lucide-react';
import dynamic from 'next/dynamic';

const IndustryDemo = dynamic(
  () => import('@/features/landing/components/IndustryDemo').then(mod => mod.IndustryDemo),
  { ssr: false }
);

import { Button } from '@/components/ui/Button';
import { Navbar } from '@/features/landing/components/Navbar';
import { WebGLShader } from '@/components/ui/WebGLShader/WebGLShader';
import { Logo } from '@/components/common/Logo';

import { TrustSection } from '@/features/landing/components/TrustSection';
import { Integrations } from '@/features/landing/components/Integrations';
import { EnterpriseFeatures } from '@/features/landing/components/EnterpriseFeatures';
import { FAQ } from '@/features/landing/components/FAQ';
import { Footer } from '@/features/landing/components/Footer';
import { UseCases } from '@/features/landing/components/UseCases';
import SonicWaveformHero from '@/components/ui/sonic-waveform';
import PricingSection5 from '@/components/ui/pricing';
import styles from './page.module.css';

/* ============================================
   LANDING PAGE
   ============================================ */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ============================================
            1. HERO SECTION (Sonic Waveform)
            ============================================ */}
        <SonicWaveformHero />

        {/* ============================================
            3. INDUSTRY DEMO
            ============================================ */}
        <IndustryDemo />

        {/* ============================================
            1.5 TRUST SECTION (Removed due to redundancy)
            ============================================ */}

        {/* ============================================
            7. HOW IT WORKS
            ============================================ */}
        <section id="how-it-works" className={styles['how-it-works']}>
          <div className={styles['how-it-works__inner']}>
            <div className={styles['how-it-works__header']}>
              <h2 className={styles.section__heading}>
                From the First Ring to the CRM Update — Every Step Is Controlled
              </h2>
            </div>
            <p className={styles['how-it-works__intro']}>
              Unlike traditional IVR (which routes calls) or generic AI voice (which improvises
              responses), KantaSwara executes a structured business process on every call.
            </p>

            <div className={styles['how-it-works__steps']}>
              {[
                {
                  num: '1',
                  title: 'Instant Response',
                  desc: 'A human-quality AI answers instantly, with zero hold time.',
                  status: 'completed',
                },
                {
                  num: '2',
                  title: 'Intent Classification',
                  desc: 'The caller\'s specific business goal is identified to trigger the right workflow.',
                  status: 'completed',
                },
                {
                  num: '3',
                  title: 'Rules-Based Orchestration',
                  desc: 'Follows your exact business rules and qualification sequence.',
                  status: 'completed',
                },
                {
                  num: '4',
                  title: 'Knowledge Retrieval',
                  desc: 'Queries your documents in real time to provide accurate, grounded answers.',
                  status: 'completed',
                },
                {
                  num: '5',
                  title: 'Automated Business Action',
                  desc: 'Books appointments, logs support tickets, or escalates to a human if required.',
                  status: 'active',
                },
                {
                  num: '6',
                  title: 'System of Record Sync',
                  desc: 'Call data and business outcomes are logged directly into your CRM automatically.',
                  status: 'upcoming',
                },
                {
                  num: '7',
                  title: 'Team Handoff',
                  desc: 'Sales team receives a structured brief before any required follow-up.',
                  status: 'upcoming',
                },
              ].map((step, index, arr) => (
                <div key={step.num} className={styles.step}>
                  <div className={styles.step__indicator}>
                    <div className={`${styles.step__number} ${styles[`step__number--${step.status}`]}`}>
                      {step.num}
                    </div>
                    {index < arr.length - 1 && (
                      <div className={`${styles.step__line} ${styles[`step__line--${step.status}`]}`} />
                    )}
                  </div>
                  <div className={styles.step__content}>
                    <h3 className={styles.step__title}>{step.title}</h3>
                    <p className={styles.step__description}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles['how-it-works__footer']}>
              No recordings lost in inboxes. No CRM fields left blank. No follow-up forgotten.
            </p>
          </div>
        </section>



        {/* ============================================
            9. OPERATIONS CENTER
            ============================================ */}
        <section className={styles.operations}>
          <div className={styles.operations__inner}>
            <div className={styles.operations__content}>
              <h2 className={styles.section__heading}>
                One Dashboard. Your Entire AI Workforce.
              </h2>
              <div className={styles.section__body}>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                  Monitor live AI voice agents, conversations, workflows, and business outcomes from one centralized operations dashboard.
                </p>
                <p>
                  Key Highlights:
                </p>
                <ul className={styles.operations__list}>
                  <li className={styles.operations__list_item}>Live call monitoring</li>
                  <li className={styles.operations__list_item}>Workflow execution tracking</li>
                  <li className={styles.operations__list_item}>Real-time analytics</li>
                  <li className={styles.operations__list_item}>Lead & appointment insights</li>
                  <li className={styles.operations__list_item}>Agent performance metrics</li>
                  <li className={styles.operations__list_item}>Operational ROI dashboard.</li>
                </ul>
              </div>
            </div>
            <div className={styles.operations__image_wrapper}>
              <Image
                src="/images/Gemini_Generated_Image_ql6m4aql6m4aql6m.png"
                alt="KantaSwara Dashboard Mockup"
                width={800}
                height={800}
                className={styles.operations__image}
                priority
              />
            </div>
          </div>
        </section>

        {/* ============================================
            10. INTEGRATIONS (Removed)
            ============================================ */}

        {/* ============================================
            2. USE CASES
            ============================================ */}
        <UseCases />

        {/* ============================================
            11. ENTERPRISE FEATURES
            ============================================ */}
        <EnterpriseFeatures />

        {/* ============================================
            11.5 PRICING
            ============================================ */}
        <PricingSection5 />

        {/* ============================================
            12. FAQ
            ============================================ */}
        <FAQ />

        {/* ============================================
            13. FINAL CTA
            ============================================ */}
        <section className={styles['final-cta']}>
          <div className={styles['final-cta__card']}>
            <div className={styles['final-cta__bg']}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1200 480"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="cta-glow" cx="80%" cy="100%" r="70%">
                    <stop offset="0%" stopColor="#FF5E00" stopOpacity="0.35" />
                    <stop offset="35%" stopColor="#FF5E00" stopOpacity="0.12" />
                    <stop offset="70%" stopColor="#FF5E00" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#FF5E00" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="cta-line-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.02" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="70%" stopColor="#FF5E00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF5E00" stopOpacity="0.5" />
                  </linearGradient>
                  <filter id="cta-glow-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <rect width="100%" height="100%" fill="#0a0a0c" rx="32" />
                <rect width="100%" height="100%" fill="url(#cta-glow)" rx="32" />
                {Array.from({ length: 32 }).map((_, index) => {
                  const r = 380 + index * 26;
                  return (
                    <circle
                      key={index}
                      cx="360"
                      cy="740"
                      r={r}
                      stroke="url(#cta-line-grad)"
                      strokeWidth="1.2"
                      opacity={0.85}
                    />
                  );
                })}
                {Array.from({ length: 5 }).map((_, index) => {
                  const r = 580 + index * 52;
                  return (
                    <circle
                      key={`glow-${index}`}
                      cx="360"
                      cy="740"
                      r={r}
                      stroke="#FF5E00"
                      strokeWidth="2.5"
                      filter="url(#cta-glow-blur)"
                      opacity={0.12}
                    />
                  );
                })}
              </svg>
            </div>

            <div className={styles['final-cta__content']}>
              <h2 className={styles['final-cta__title']}>
                Stop missing opportunities.<br />Start automating conversations today.
              </h2>

              <div className={styles['final-cta__primary-action']}>
                <Link href="/register" className={styles['final-cta__signup-btn']}>
                  Sign up
                </Link>
              </div>

              <p className={styles['final-cta__secondary-title']}>
                Not ready to sign up?
              </p>

              <div className={styles['final-cta__secondary-actions']}>
                <Link
                  href="/demo"
                  id="footer-cta-demo-btn"
                  className={styles['final-cta__assistant-link']}
                >
                  Try Live Demo
                </Link>
                <Link
                  href="/contact"
                  className={styles['final-cta__assistant-link']}
                >
                  Talk to Sales
                </Link>
                <Link
                  href="/docs"
                  className={styles['final-cta__assistant-link']}
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================
          FOOTER
          ============================================ */}
      <Footer />
    </>
  );
}
