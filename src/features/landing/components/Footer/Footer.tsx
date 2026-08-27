import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16" />
    <path d="M4 20L20 4" />
  </svg>
);

const ArrowRightIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
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
    <footer className="bg-[#0a0a0c] text-white pt-16 pb-8 relative overflow-hidden font-sans border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-10">
          {/* Brand & Socials */}
          <div className="max-w-lg">
            <Link href="/" aria-label="Home">
              <Logo className="h-10 w-auto text-[#ff5500] mb-6" />
            </Link>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              Enterprise AI Voice Operations Platform enabling organizations to deploy, manage, and monitor intelligent AI voice agents for customer support, sales, appointment booking, and lead qualification.
            </p>
            
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                <LinkedinIcon size={18} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                <GithubIcon size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                <TwitterIcon size={18} />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <h4 className="text-sm text-gray-400 mb-3">Stay up to date. Subscribe to our Newsletter</h4>
            <div className="flex items-center w-full max-w-md bg-[#121212] rounded-md overflow-hidden border border-gray-800 focus-within:border-gray-600 transition-colors">
              <input 
                type="email" 
                placeholder="Enter your Email" 
                className="bg-transparent text-white px-4 py-2.5 outline-none w-full text-sm placeholder-gray-500 min-w-[220px]"
              />
              <button className="bg-[#ff4400] hover:bg-[#ff5500] text-white px-5 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap">
                Submit <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mb-12">
          
          {/* PLATFORM Column */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Platform</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Overview</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Features</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">AI Voice Agents</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Live Demo</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Solutions</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* COMPANY Column */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Company</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* RESOURCES Column */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Resources</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* ENTERPRISE Column */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Enterprise</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Organization Portal</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Super Admin</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Request Demo</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Partner Program</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="relative pt-8 pb-8 mt-8 border-t border-gray-800 flex flex-col items-center justify-center text-center w-full">


          {/* Foreground Text */}
          <div className="relative z-10 mt-12">
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              © 2026 KantaSwara. Enterprise AI Voice Operations Platform. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
              <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
          
        </div>
      </div>

      {/* Full-width Background large text (Faded) */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden opacity-[0.15]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 10%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 80%)'
        }}
      >
        <span className="w-full text-center font-black tracking-tighter bg-gradient-to-b from-[#ff8800] to-[#ff5500] bg-clip-text text-transparent leading-none font-sans whitespace-nowrap" style={{ fontSize: '18vw', marginBottom: '-2%' }}>
          KantaSwara
        </span>
      </div>
    </footer>
  );
}
