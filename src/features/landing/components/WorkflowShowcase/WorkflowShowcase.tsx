'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './WorkflowShowcase.module.css';

const ACCORDION_ITEMS = [
  {
    title: 'Workflow-Driven Conversations',
    description: 'Every AI agent follows a visual workflow designed by your team. Define conversation paths, conditions, branching logic, retries, and business actions without writing code.',
    activeNodes: [1, 2, 3]
  },
  {
    title: 'Business-Specific AI Employees',
    description: 'Deploy specialized AI agents for Real Estate, EdTech, and Automobile businesses, each optimized for industry-specific customer journeys and booking workflows.',
    activeNodes: [0, 1]
  },
  {
    title: 'Knowledge-Aware Responses',
    description: 'Agents retrieve information from your business documents, FAQs, brochures, property listings, course catalogs, or vehicle specifications before responding, ensuring accurate and contextual conversations.',
    activeNodes: [4]
  },
  {
    title: 'Automated Business Actions',
    description: 'Conversations don\'t stop at answering questions. KantaSwara books appointments, schedules site visits, confirms counselling sessions, creates CRM records, updates lead status, and triggers business workflows automatically.',
    activeNodes: [5]
  },
  {
    title: 'Real-Time Operations Dashboard',
    description: 'Monitor every active call, workflow stage, transcript, agent status, and booking outcome from a centralized operations console with complete visibility into your AI workforce.',
    activeNodes: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Enterprise-Ready Platform',
    description: 'Built with multi-tenant architecture, role-based access control, audit logging, secure integrations, and scalable infrastructure to support growing organizations.',
    activeNodes: [6]
  }
];

const NODES = [
  'Customer Call',
  'Greeting',
  'Intent Detection',
  'Workflow Engine',
  'Business Knowledge',
  'Business Action',
  'CRM Updated'
];

export function WorkflowShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ACCORDION_ITEMS.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const activeNodes = ACCORDION_ITEMS[activeIndex].activeNodes;

  return (
    <section className={styles.showcase} id="workflow-showcase">
      <div className={styles.showcase__inner}>
        <header className={styles.showcase__header}>
          <div className={styles.showcase__eyebrow}>Orchestrating Outcomes</div>
          <h2 className={styles.showcase__headline}>Every Conversation Follows a Business Workflow</h2>
          <p className={styles.showcase__subheadline}>
            Unlike traditional voice bots that simply answer questions, KantaSwara orchestrates every interaction through structured business workflows, ensuring every conversation ends with a measurable business outcome.
          </p>
        </header>

        <div 
          className={styles.showcase__grid}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left: SVG Visualization */}
          <div className={styles.visualization}>
            <svg 
              className={styles.svgTree}
              viewBox="0 0 300 520"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Draw connecting lines first so they are behind nodes */}
              {NODES.map((_, i) => {
                if (i === NODES.length - 1) return null; // No line after last node
                const startY = 20 + i * 70 + 40; // node top + height
                const endY = 20 + (i + 1) * 70;
                
                return (
                  <g key={`line-${i}`}>
                    <path
                      d={`M 150 ${startY} L 150 ${endY}`}
                      className={styles.pathLine}
                    />
                    {/* Animated Pulse Overlay */}
                    {activeNodes.includes(i) && activeNodes.includes(i + 1) && (
                      <motion.path
                        d={`M 150 ${startY} L 150 ${endY}`}
                        className={styles.pulsePath}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {NODES.map((nodeLabel, i) => {
                const isActive = activeNodes.includes(i);
                const yPos = 20 + i * 70;
                
                return (
                  <g key={`node-${i}`}>
                    <rect
                      x="50"
                      y={yPos}
                      width="200"
                      height="40"
                      className={`${styles.node} ${isActive ? styles.nodeActive : ''}`}
                    />
                    <text
                      x="150"
                      y={yPos + 21}
                      className={`${styles.nodeText} ${isActive ? styles.nodeTextActive : ''}`}
                    >
                      {nodeLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Accordion */}
          <div className={styles.accordion}>
            {ACCORDION_ITEMS.map((item, idx) => {
              const isActive = activeIndex === idx;
              
              return (
                <div 
                  key={idx}
                  className={`${styles.accordion__item} ${isActive ? styles['accordion__item--active'] : ''}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className={styles.accordion__header}>
                    <h3 className={styles.accordion__title}>{item.title}</h3>
                    <ChevronDown className={styles.accordion__icon} size={20} />
                  </div>
                  
                  {/* We use Framer Motion for a smoother accordion reveal */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isActive ? 'auto' : 0, 
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? '12px' : '0px'
                    }}
                    style={{ overflow: 'hidden' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <p className={styles.accordion__description}>{item.description}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
