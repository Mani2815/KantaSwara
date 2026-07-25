import React from 'react';
import { Database, Calendar, Mail, Webhook, PhoneCall } from 'lucide-react';
import styles from './Integrations.module.css';

const INTEGRATION_CATEGORIES = [
  {
    title: 'CRM Systems',
    icon: <Database className={styles.integration__icon} size={24} />,
    items: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Freshsales', 'LeadSquared'],
  },
  {
    title: 'Scheduling',
    icon: <Calendar className={styles.integration__icon} size={24} />,
    items: ['Google Calendar', 'Microsoft Outlook', 'Calendly', 'Cal.com'],
  },
  {
    title: 'Communications',
    icon: <Mail className={styles.integration__icon} size={24} />,
    items: ['Slack', 'Microsoft Teams', 'Email Notifications', 'SMS Gateways'],
  },
  {
    title: 'Voice Providers',
    icon: <PhoneCall className={styles.integration__icon} size={24} />,
    items: ['Twilio', 'Plivo', 'Exotel', 'Amazon Connect'],
  },
  {
    title: 'Custom Workflows',
    icon: <Webhook className={styles.integration__icon} size={24} />,
    items: ['REST APIs', 'Custom Webhooks', 'Zapier', 'Make.com'],
  },
];

export function Integrations() {
  return (
    <section id="integrations" className={styles.integrations}>
      <div className={styles.integrations__inner}>
        <div className={styles.integrations__header}>
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-4">
            Ecosystem Integrations
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Connects seamlessly with your existing stack.
          </h2>
          <p className="text-lg text-gray-400">
            KantaSwara isn&apos;t another silo. It reads from your knowledge base and writes directly to your systems of record, functioning as a true digital employee.
          </p>
        </div>

        <div className={styles.integrations__grid}>
          {INTEGRATION_CATEGORIES.map((category, index) => (
            <div key={index} className={styles.integration__category}>
              <h3 className={styles.integration__title}>
                {category.icon}
                {category.title}
              </h3>
              <div className={styles.integration__list}>
                {category.items.map((item, idx) => (
                  <div key={idx} className={styles.integration__item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
