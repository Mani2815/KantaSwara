import React from 'react';
import { Layers, Users, FileText, Lock, Zap, BarChart2, Server } from 'lucide-react';
import styles from './EnterpriseFeatures.module.css';

const FEATURES = [
  {
    icon: <Layers size={18} />,
    title: 'Multi-tenant Architecture',
  },
  {
    icon: <Users size={18} />,
    title: 'Role-Based Access Control',
  },
  {
    icon: <FileText size={18} />,
    title: 'Full Conversation Audit Trail',
  },
  {
    icon: <Lock size={18} />,
    title: 'Secure Document Storage',
  },
  {
    icon: <Zap size={18} />,
    title: 'API-First CRM Integration',
  },
  {
    icon: <BarChart2 size={18} />,
    title: 'Real-Time Analytics',
  },
  {
    icon: <Server size={18} />,
    title: 'Concurrent Call Handling',
  },
];

export function EnterpriseFeatures() {
  return (
    <section className={styles.enterprise}>
      <div className={styles.enterprise__inner}>
        <div className={styles.enterprise__header}>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-4">
            Built to Run at Business Scale
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] font-medium">
            Enterprise requirements built into the core platform, not sold as add-ons.
          </p>
        </div>

        <div className={styles.enterprise__pills}>
          {FEATURES.map((feature, index) => (
            <div key={index} className={styles.pill}>
              <span className={styles.pill__icon}>{feature.icon}</span>
              <span className={styles.pill__text}>{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
