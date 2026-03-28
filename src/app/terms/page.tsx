"use client";

import React, { useState } from 'react';
import { ShieldCheck, FileText, Scale, Lock, ChevronRight, Mail } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Legal <span className="text-[#008cff]">Center</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Everything you need to know about using Dakhla.world platform.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200 dark:bg-slate-900 rounded-2xl mb-10 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'terms' 
              ? 'bg-white dark:bg-[#008cff] text-[#008cff] dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" /> Terms
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'privacy' 
              ? 'bg-white dark:bg-[#008cff] text-[#008cff] dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" /> Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Contact Footer */}
        <div className="mt-12 text-center p-8 bg-[#008cff]/5 dark:bg-[#008cff]/10 rounded-3xl border border-[#008cff]/20">
          <Mail className="w-8 h-8 text-[#008cff] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Have Legal Questions?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">If you have any doubts about our terms, feel free to reach out.</p>
          <a href="mailto:dakhla.world@gmail.com" className="text-[#008cff] font-bold hover:underline">
            dakhla.world@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 last:mb-0">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
        <ChevronRight className="w-5 h-5 text-[#008cff]" /> {title}
      </h2>
      <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-3 pl-7">
        {children}
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Section title="1. Introduction">
        Welcome to Dakhla.world. By using our platform, you agree to comply with these Terms & Conditions.
      </Section>
      <Section title="2. Platform Purpose">
        Dakhla.world is an online platform that connects students with academic and skill-based institutions. 
        We provide listings and facilitate discovery, but we do not guarantee admission.
      </Section>
      <Section title="3. User Accounts">
        Users must provide accurate info and keep credentials secure. We reserve the right to suspend accounts in case of misuse.
      </Section>
      <Section title="4. Payments & Subscriptions">
        Paid plans (Featured/Pro) are for promotional benefits only. Payments are manual (QR-based) and non-refundable.
      </Section>
      <Section title="5. Content Usage">
        All content (logo, text, design) is protected. Users may not copy or reuse without permission.
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Section title="1. Information We Collect">
        <p><strong>Students:</strong> Name, Email, Phone, and Academic details.</p>
        <p><strong>Institutions:</strong> Name, Contact details, and Program info.</p>
      </Section>
      <Section title="2. How We Use Data">
        We use data to manage accounts, process applications, and improve the platform experience. We do not sell your personal data.
      </Section>
      <Section title="3. Data Sharing">
        Data is shared with institutions only when you apply. We may also share with hosting/analytics providers.
      </Section>
      <Section title="4. Cookies">
        We use cookies to improve user experience and track basic analytics.
      </Section>
      <Section title="5. User Rights">
        You can request a data update or account deletion at any time by contacting us.
      </Section>
    </div>
  );
}