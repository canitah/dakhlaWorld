import React from 'react';
import { 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  Globe, 
  Rocket, 
  Users, 
  Search, 
  GraduationCap, 
  MousePointer2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-20">
      {/* 1. Hero Section */}
      <section className="py-16 px-4 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#008cff] font-bold tracking-widest uppercase text-sm px-4 py-1 bg-blue-50 rounded-full dark:bg-blue-900/20">
            About Dakhla.world
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Your Gateway to Admissions, <br />
            <span className="text-[#008cff] font-serif italic">Skills & Opportunities</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Dakhla.world is a modern education platform designed to simplify how students discover and apply to academic and skill-based programs.
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision (Grid) */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Rocket className="w-12 h-12 text-[#008cff] mb-6" />
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To make admissions accessible, transparent, and stress-free for every student. We believe everyone deserves clear information and equal opportunities.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Lightbulb className="w-12 h-12 text-amber-500 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We aim to become a leading global platform for admissions and skills discovery, starting from Pakistan and expanding internationally.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Features (What We Do) */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">What We Do</h2>
            <p className="text-slate-500 mt-2">Connecting students with institutions across Pakistan</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-[#008cff]" />}
              title="Smart Discovery"
              desc="Search programs based on City, Category, and Interests without switching websites."
            />
            <FeatureCard 
              icon={<MousePointer2 className="w-6 h-6 text-[#008cff]" />}
              title="Easy Application"
              desc="Apply directly through the platform or via official institute links in a few clicks."
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6 text-[#008cff]" />}
              title="Beyond Degrees"
              desc="From technical diplomas to sports and creative courses—we cover it all."
            />
          </div>
        </div>
      </section>

      {/* 4. Why Dakhla? (Comparison) */}
      <section className="py-20 px-4 bg-[#008cff] text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Why Dakhla?</h2>
            <p className="mb-8 text-blue-100">Traditional admissions are confusing and scattered. Dakhla solves this by providing:</p>
            <ul className="space-y-4">
              {['Centralized Platform', 'Verified Listings', 'Simple Navigation', 'Faster Decisions'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Users className="w-6 h-6" /> Who Is It For?
             </h3>
             <div className="grid grid-cols-2 gap-4 text-sm text-blue-50">
               <span>• Matric & Inter Students</span>
               <span>• O/A Levels Students</span>
               <span>• University Applicants</span>
               <span>• Skill-based Learners</span>
               <span>• Career Switchers</span>
               <span>• Parents</span>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 italic">"Every dream deserves a door. Dakhla is that door."</h2>
        <p className="text-slate-500 mb-10 max-w-lg mx-auto">
          Start your journey today. Explore programs and take the next step toward your future.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/programs">
            <Button size="lg" className="bg-[#008cff] hover:bg-[#0066cc] px-8 rounded-full">
              Explore Programs
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="px-8 rounded-full">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all dark:border-slate-800">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}