"use client";

import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Users, FileCheck, School, Star } from "lucide-react";

// Counting Animation Component
function Counter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract number from string (e.g., "4,000+" -> 4000)
  const numericValue = parseInt(value.replace(/,/g, ""));

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numericValue;
      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;

      const timer = setInterval(() => {
        start += Math.ceil(end / 100); // Speed up the increments
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{value.includes("+") ? "+" : ""}
    </span>
  );
}

const stats = [
  { id: 1, label: "Success Stories", value: "200+", icon: <Users className="w-6 h-6 text-blue-500" />, description: "Students placed" },
  { id: 2, label: "Applications", value: "4,000+", icon: <FileCheck className="w-6 h-6 text-green-500" />, description: "Processed via Dakhla" },
  { id: 3, label: "Institutions", value: "50+", icon: <School className="w-6 h-6 text-purple-500" />, description: "Partner schools" },
  { id: 4, label: "Programs", value: "1,200+", icon: <Star className="w-6 h-6 text-yellow-500" />, description: "Active courses" },
];

export default function TrustBar() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                <Counter value={stat.value} />
              </h3>
              <p className="text-sm font-bold text-[#008cff] uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}