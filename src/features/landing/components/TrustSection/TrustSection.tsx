import React from 'react';
import { Shield, Layers, Lock, GitBranch, Server } from 'lucide-react';
import styles from './TrustSection.module.css';

const TRUST_FEATURES = [
  { icon: <Layers size={16} />, label: 'Multi-Tenant Architecture' },
  { icon: <Shield size={16} />, label: 'Enterprise Security' },
  { icon: <Lock size={16} />, label: 'Role-Based Access Control' },
  { icon: <GitBranch size={16} />, label: 'Native CRM Integration' },
  { icon: <Server size={16} />, label: '99.99% Uptime SLA' },
];

export function TrustSection() {
  return (
    <section className={styles.trust}>
      <div className={styles.trust__inner}>
        <p className={styles.trust__label}>Built for Enterprise Business Operations</p>
        <div className={styles.trust__grid}>
          {TRUST_FEATURES.map((feature, index) => (
            <div key={index} className={styles.trust__item}>
              <span className={styles.trust__icon}>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
