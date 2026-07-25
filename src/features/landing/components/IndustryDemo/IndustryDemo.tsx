'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, Mic, Home, GraduationCap, Car, Calendar, TrendingUp, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './IndustryDemo.module.css';

type WorkflowStatus = 'done' | 'current' | 'pending';

interface WorkflowStep {
  step: string;
  status: WorkflowStatus;
}

interface IndustryData {
  id: string;
  icon: LucideIcon;
  title: string;
  role: string;
  description: string;
  panelHeader: {
    title: string;
    description: string;
  };
  builtFor: string[];
  capabilities: string[];
  businessOutcome: Array<{
    text: string;
    icon: LucideIcon;
  }>;
}

const INDUSTRIES: IndustryData[] = [
  {
    id: 'real_estate',
    icon: Home,
    title: 'Real Estate',
    role: 'Property Sales Assistant',
    description: 'Augments your sales team by qualifying leads and booking verified site visits.',
    panelHeader: {
      title: 'Property Sales Assistant',
      description: 'Built for real estate businesses to automate property enquiries and convert interested buyers into scheduled site visits.',
    },
    builtFor: [
      'Residential Projects',
      'Commercial Properties',
      'Villas & Apartments',
      'Rental Properties',
    ],
    capabilities: [
      'Qualify Buyer Requirements',
      'Recommend Suitable Properties',
      'Answer Project & Pricing Questions',
      'Schedule Site Visits',
      'Capture Lead Information',
      'Create & Update CRM Records',
    ],
    businessOutcome: [
      { text: 'Site Visit Scheduled', icon: Calendar },
      { text: 'Qualified Lead Generated', icon: TrendingUp },
    ],
  },
  {
    id: 'edtech',
    icon: GraduationCap,
    title: 'EdTech',
    role: 'Admission Counselor',
    description: 'Acts as a frontline counselor to verify eligibility and schedule sessions.',
    panelHeader: {
      title: 'Admission Counselor',
      description: 'Built for educational institutions to guide prospective students from course enquiry to counselling and admission.',
    },
    builtFor: [
      'Universities',
      'Online Learning Platforms',
      'Training Institutes',
      'Professional Certification Providers',
    ],
    capabilities: [
      'Course Discovery & Recommendations',
      'Eligibility Verification',
      'Fee & Curriculum Assistance',
      'Counselling Session Booking',
      'Student Lead Qualification',
      'Admission CRM Updates',
    ],
    businessOutcome: [
      { text: 'Counselling Session Scheduled', icon: GraduationCap },
      { text: 'Qualified Student Lead', icon: TrendingUp },
    ],
  },
  {
    id: 'automobile',
    icon: Car,
    title: 'Automobile',
    role: 'Vehicle Sales Consultant',
    description: 'Replaces manual follow-ups by analyzing needs and confirming test drives.',
    panelHeader: {
      title: 'Vehicle Sales Consultant',
      description: 'Built for automobile dealerships to qualify buyers, recommend vehicles, and schedule dealership visits.',
    },
    builtFor: [
      'Car Dealerships',
      'Two-Wheeler Showrooms',
      'Commercial Vehicle Dealers',
      'EV Dealerships',
    ],
    capabilities: [
      'Vehicle Requirement Analysis',
      'Model & Variant Recommendations',
      'Finance & Offer Information',
      'Test Drive Scheduling',
      'Customer Lead Qualification',
      'Dealer CRM Synchronization',
    ],
    businessOutcome: [
      { text: 'Test Drive Confirmed', icon: Car },
      { text: 'Sales Lead Qualified', icon: TrendingUp },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const outcomeVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.45 },
  },
};

export function IndustryDemo() {
  const [activeId, setActiveId] = useState<string>(INDUSTRIES[0].id);

  const activeIndustry = INDUSTRIES.find((ind) => ind.id === activeId) || INDUSTRIES[0];

  return (
    <section id="industries" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.headline}>Experience Industry-Specific AI Voice Agents</h2>
          <p className={styles.subheadline}>
            Select an industry below to see how KantaSwara&apos;s AI employees automate customer journeys.
          </p>
        </div>

        <div className={styles.grid}>
          {/* LEFT: INDUSTRY SELECTOR */}
          <div>
            <h3 className={styles.selector_title}>Industry Selector</h3>
            <div className={styles.card_list}>
              {INDUSTRIES.map((industry) => (
                <div
                  key={industry.id}
                  className={cn(styles.card, activeId === industry.id && styles['card--active'])}
                  onClick={() => setActiveId(industry.id)}
                >
                  <div className={styles.card__icon}>
                    <industry.icon 
                      size={28} 
                      className={cn(
                        "transition-colors duration-200",
                        activeId === industry.id ? "text-orange-500" : "text-gray-400"
                      )} 
                    />
                  </div>
                  <div className={styles.card__content}>
                    <h3>{industry.title}</h3>
                    <p>
                      <strong>{industry.role}</strong>
                      <br />
                      {industry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LIVE VOICE AGENT PANEL */}
          <div className={styles.panel_wrapper}>
            <div className={styles.panel_header}>
              <span className={styles.panel_icon}>
                <activeIndustry.icon size={20} className="text-orange-500" />
              </span>
              <span className={styles.panel_title}>{activeIndustry.role}</span>
            </div>

            <motion.div
              key={activeId}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className={styles.panel_body}
            >
              {/* Header */}
              <div className="pb-3 border-b border-[#1E2738] flex flex-col gap-1.5">
                <h4 className="text-white text-lg font-bold">{activeIndustry.panelHeader.title}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{activeIndustry.panelHeader.description}</p>
              </div>

              {/* Built For */}
              <div className="pb-3 border-b border-[#1E2738] flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Built For</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeIndustry.builtFor.map((item, index) => (
                    <span key={index} className="bg-[#141926] border border-[#273347] text-slate-200 text-[11px] px-3 py-1 rounded-full font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capabilities */}
              <div className="pb-3 border-b border-[#1E2738] flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capabilities</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {activeIndustry.capabilities.map((cap, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants as any}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{cap}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Business Outcome */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Outcome</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeIndustry.businessOutcome.map((outcome, index) => (
                    <motion.div
                      key={index}
                      variants={outcomeVariants as any}
                      className="bg-orange-500/15 border border-orange-500/30 text-orange-400 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm"
                    >
                      <outcome.icon className="w-4 h-4 shrink-0 text-orange-400" />
                      <span>{outcome.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className={styles.panel_footer}>
              <button className={styles.demo_btn}>
                <Mic size={18} /> Start Voice Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
