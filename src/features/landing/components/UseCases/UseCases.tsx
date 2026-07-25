'use client';

import { ArrowRight } from 'lucide-react';

const USE_CASES = [
  {
    title: 'Replace your IVR',
    description: 'Callers say what they need in plain language. The agent routes, resolves, or books it in one conversation, no phone tree.',
  },
  {
    title: 'Answer every inbound call',
    description: 'Greets every caller, verifies identity, answers questions, and hands complex cases to your team with full context.',
  },
  {
    title: 'Run outbound at scale',
    description: 'Qualifies leads, confirms appointments, and follows up on every account, without adding headcount.',
  },
  {
    title: 'Never miss a call',
    description: 'An AI receptionist picks up nights, weekends, and volume spikes, so no caller lands in voicemail.',
  },
  {
    title: 'Qualify every lead',
    description: 'Reaches every new lead while interest is fresh, asks your qualifying questions, and routes buyers to reps.',
  },
  {
    title: 'Automate customer service',
    description: 'Resolves routine support calls end to end: order status, account changes, scheduling, cancellations.',
  },
  {
    title: 'Sound human on every call',
    description: 'KantaSwara\'s own speech models handle interruptions, accents, and topic changes, with sub-400ms latency in multiple languages.',
  },
];

export function UseCases() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-[1150px] mx-auto w-full relative z-10 bg-white dark:bg-black">
      <div className="mb-10 lg:mb-12">
        <h2 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tighter text-neutral-900 dark:text-white leading-[1.1] font-[family-name:var(--font-heading)]">
          What do companies <br className="hidden md:block" /> use KantaSwara for?
        </h2>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {USE_CASES.map((useCase, index) => (
          <div 
            key={index}
            className="group flex flex-col h-full bg-[#f8f8f8] dark:bg-neutral-900/50 p-5 rounded-xl cursor-pointer hover:bg-[#f1f1f1] dark:hover:bg-neutral-900 transition-colors duration-300"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              {useCase.title}
            </h3>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed flex-1 pr-1">
              {useCase.description}
            </p>
            <div className="mt-5 flex justify-end">
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" strokeWidth={2} />
            </div>
          </div>
        ))}

        {/* Final "See all solutions" Card */}
        <div className="group flex flex-col h-full bg-white dark:bg-black p-5 rounded-xl cursor-pointer transition-all duration-300">
          <div className="flex-1 flex items-end">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              See all solutions
            </h3>
          </div>
          <div className="mt-5 flex justify-end">
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" strokeWidth={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
