'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

const FAQS = [
  {
    question: 'How is KantaSwara different from traditional IVR?',
    answer: 'Traditional IVRs use static decision trees ("Press 1 for Sales") that frustrate callers. KantaSwara uses conversational AI to understand natural language intent, instantly routing callers to the right workflow without them ever touching a keypad.',
  },
  {
    question: 'Can conversations seamlessly hand off to human agents?',
    answer: 'Yes. If a caller requests a human, or if the AI detects a highly complex edge case, the system immediately transfers the call to the appropriate team member, complete with a transcript and brief of the conversation thus far.',
  },
  {
    question: 'How do we train the AI on our specific business knowledge?',
    answer: 'You simply upload your existing documents—property brochures, pricing PDFs, course catalogs, or FAQ docs. Our system automatically parses this into a secure vector database that the AI retrieves from in real time during calls. No model fine-tuning required.',
  },
  {
    question: 'Does it integrate with our existing CRM?',
    answer: 'Yes. KantaSwara provides native triggers to update standard CRMs (like Salesforce and HubSpot) directly from workflow actions. You can also use Webhooks or our REST API for custom internal systems.',
  },
  {
    question: 'How long does it take to deploy?',
    answer: 'Because you aren\'t building AI models from scratch, deployment is rapid. You can select an industry template, customize the workflow, upload your knowledge documents, and be live in days rather than months.',
  },
  {
    question: 'Is it suitable for enterprise organizations?',
    answer: 'Absolutely. We offer a multi-tenant architecture, Role-Based Access Control (RBAC), full audit logs for compliance, and enterprise-grade security protocols designed specifically for B2B operations.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.faq}>
      <div className={styles.faq__inner}>
        <div className={styles.faq__header}>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className={styles.faq__list}>
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={styles.faq__item} 
              data-open={openIndex === index}
            >
              <button 
                className={styles.faq__question}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                <ChevronDown className={styles.faq__icon} size={20} />
              </button>
              <div className={styles.faq__answer}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
