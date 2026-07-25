'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, GraduationCap, Car, TrendingUp } from 'lucide-react';
import styles from './BusinessOutcomes.module.css';

// Smooth requestAnimationFrame based count-up hook/component
const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = previousValueRef.current;
    const endValue = value;

    // Animation duration 600ms
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 600, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.floor(startValue + easeProgress * (endValue - startValue));

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        previousValueRef.current = endValue;
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span className={styles.metricNumber}>
      {displayValue}{suffix}
    </span>
  );
};

interface OutcomeCardData {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  metrics: {
    label: string;
    value: number;
    suffix?: string;
  }[];
  activities: string[];
  impacts: string[];
}

const OUTCOMES_DATA: OutcomeCardData[] = [
  {
    id: 'real_estate',
    icon: Home,
    title: 'Real Estate',
    metrics: [
      { label: 'Property Inquiries', value: 42 },
      { label: 'Qualified Buyers', value: 28 },
      { label: 'Site Visits', value: 18 },
      { label: 'CRM Updates', value: 17 },
      { label: 'Completion Rate', value: 96, suffix: '%' }
    ],
    activities: [
      'Buyer qualified for 3BHK budget range',
      'Site visit confirmed for Saturday 11 AM',
      'Lead status updated to "Qualified Buyer" in CRM',
      'Follow-up task created for agent assignment'
    ],
    impacts: [
      'Reduced manual follow-up by 74%',
      'Lead qualification time cut to under 2 mins',
      '40% higher appointment conversion rate'
    ]
  },
  {
    id: 'edtech',
    icon: GraduationCap,
    title: 'EdTech',
    metrics: [
      { label: 'Course Inquiries', value: 65 },
      { label: 'Qualified Students', value: 45 },
      { label: 'Counselling Booked', value: 24 },
      { label: 'CRM Updates', value: 24 },
      { label: 'Completion Rate', value: 98, suffix: '%' }
    ],
    activities: [
      'Student qualified for Executive MBA inquiry',
      'Counselling session booked with Senior Advisor',
      'CRM fields updated with educational background',
      'Scholarship eligibility logic executed and logged'
    ],
    impacts: [
      '82% direct increase in course enrollment',
      'Optimized advisor bandwidth by filtering leads',
      'Instant lead engagement within 15 seconds'
    ]
  },
  {
    id: 'automobile',
    icon: Car,
    title: 'Automobile',
    metrics: [
      { label: 'Variant Inquiries', value: 38 },
      { label: 'Qualified Sales Leads', value: 26 },
      { label: 'Test Drives Booked', value: 14 },
      { label: 'Dealer CRM Updates', value: 14 },
      { label: 'Completion Rate', value: 94, suffix: '%' }
    ],
    activities: [
      'Finance qualification check passed by prospect',
      'Test drive scheduled for SUV flagship model',
      'Dealer dashboard updated with variant preference',
      'Automated branch assignment completed'
    ],
    impacts: [
      'Showroom walk-ins increased by 35%',
      '92% accuracy in pre-qualifying finance checks',
      'Zero lead leakage with instant routing to dealers'
    ]
  }
];

export function BusinessOutcomes() {
  const [activeId, setActiveId] = useState<string>('real_estate');
  const activeData = OUTCOMES_DATA.find(item => item.id === activeId) || OUTCOMES_DATA[0];

  return (
    <section className={styles.section} id="business-outcomes">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Business Outcomes</div>
          <h2 className={styles.headline}>Every Conversation Creates Business Value</h2>
          <p className={styles.subheadline}>
            KantaSwara transforms customer calls into measurable business outcomes—qualifying leads, scheduling appointments, and updating CRMs automatically.
          </p>
        </div>

        {/* Unified Tab Dashboard View with Side-by-Side selector layout */}
        <div className={styles.unifiedDashboard}>
          <div className={styles.dashboardLayout}>

            {/* Left Sidebar: Vertical Selector */}
            <div className={styles.sidebarPane}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Industries</span>
              </div>
              <div className={styles.tabsVerticalList}>
                {OUTCOMES_DATA.map((industry) => {
                  const IconComponent = industry.icon;
                  const isActive = activeId === industry.id;

                  return (
                    <button
                      key={industry.id}
                      onClick={() => setActiveId(industry.id)}
                      className={`${styles.tabVerticalButton} ${isActive ? styles.tabVerticalButtonActive : ''}`}
                    >
                      <IconComponent size={18} className={styles.tabIcon} />
                      <span className={styles.tabText}>{industry.title}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicatorVertical"
                          className={styles.activeTabIndicatorVertical}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vertical divider */}
            <div className={styles.verticalDivider} />

            {/* Right Pane: Dashboard Content */}
            <div className={styles.dashboardRightPane}>
              <div className={styles.dashboardHeader}>
                <div className={styles.dashboardStatusDot} />
                <h3 className={styles.dashboardTitle}>Today&apos;s Outcomes</h3>
                <span className={styles.liveBadge}>Live metrics</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className={styles.dashboardContent}
                >
                  {/* Metrics Grid */}
                  <div className={styles.metricsGrid}>
                    {activeData.metrics.map((metric, idx) => (
                      <div key={idx} className={styles.metricItem}>
                        <span className={styles.metricLabel}>{metric.label}</span>
                        <div className={styles.metricValueContainer}>
                          <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.paneDivider} />

                  {/* Bottom details split */}
                  <div className={styles.detailsRow}>
                    {/* Left Side: Recent Activity */}
                    <div className={styles.activitySection}>
                      <h4 className={styles.subSectionTitle}>Recent Activity</h4>
                      <div className={styles.activityList}>
                        {activeData.activities.map((activity, idx) => (
                          <div key={idx} className={styles.activityItem}>
                            <span className={styles.activityCheck}>✓</span>
                            <span className={styles.activityText}>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inner Vertical Divider */}
                    <div className={styles.innerVerticalDivider} />

                    {/* Right Side: Business Impact */}
                    <div className={styles.impactSection}>
                      <h4 className={styles.subSectionTitle}>Business Impact</h4>
                      <ul className={styles.impactList}>
                        {activeData.impacts.map((impact, idx) => (
                          <li key={idx} className={styles.impactItem}>
                            <TrendingUp size={14} className={styles.impactIcon} />
                            <span className={styles.impactText}>{impact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
