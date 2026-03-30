"use client";

import { useEffect, useState, useMemo, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Trustbar from "@/components/Trustbar";
import { Button } from "@/components/ui/button";
import { ThemeLogo } from "@/components/theme-logo";
import {
  Search,
  MapPin,
  ChevronDown,
  X,
  Bookmark,
  Clock,
  Users,
  ExternalLink,
  Building2,
  DollarSign,
  GraduationCap,
  ArrowRight,
  Calendar,
  Briefcase,
  Menu,
  Moon,
  Sun,
  BookOpen,
  Tag,
  Hash,
  Link2,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─────────────── Types ─────────────── */
interface Program {
  id: number;
  title: string;
  category: string | null;
  duration: string | null;
  deadline: string | null;
  fee: number | null;
  schedule_type: string | null;
  study_field: string | null;
  eligibility: string | null;
  application_method: string | null;
  external_url: string | null;
  program_code: string | null;
  created_at: string;
  postedByPlatform?: boolean;
  institution: {
    id: number;
    name: string;
    city: string | null;
    category: string | null;
    profilePicture: string | null;
    uniqueId: string;
    planTier: string;
  };
  applicants: number;
}

interface Filters {
  categories: string[];
  cities: string[];
  scheduleTypes: string[];
  companies: string[];
}

/* ─────────────── Helpers ─────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)}+ months ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatFee(fee: number | null): string {
  if (fee === null || fee === undefined) return "";
  return `PKR ${fee.toLocaleString()}`;
}

const FEE_RANGES = [
  { label: "Under PKR 50,000", min: 0, max: 50000 },
  { label: "PKR 50,000 – 100,000", min: 50000, max: 100000 },
  { label: "PKR 100,000 – 200,000", min: 100000, max: 200000 },
  { label: "PKR 200,000 – 500,000", min: 200000, max: 500000 },
  { label: "PKR 500,000+", min: 500000, max: null },
];

const DATE_POSTED_OPTIONS = [
  { label: "Last 24 hours", value: "today" },
  { label: "Last 3 days", value: "3days" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 14 days", value: "14days" },
];

/* ─────────────── Dropdown Component ─────────────── */
function FilterDropdown({
  label,
  icon,
  isActive,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs sm:text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${isActive
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
          }`}
      >
        {icon}
        {label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
          <div onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
  (subscribe) => () => {},
  () => true, // Client par true hoga
  () => false // Server par false hoga
);
  // Data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [initialFilters, setInitialFilters] = useState<Filters>({ categories: [], cities: [], scheduleTypes: [], companies: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");

  // Filters
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSchedule, setActiveSchedule] = useState("");
  const [activeCompany, setActiveCompany] = useState("");
  const [activeDatePosted, setActiveDatePosted] = useState("");
  const [activeFeeRange, setActiveFeeRange] = useState<{ label: string; min: number; max: number | null } | null>(null);

  // Detail panel
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Mobile
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance");

  /* ─── Reactive fetch ─── */
  useEffect(() => {
    async function fetchPrograms() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (appliedSearch) params.set("search", appliedSearch);
        if (appliedLocation) params.set("city", appliedLocation);
        if (activeCategory) params.set("category", activeCategory);
        if (activeSchedule) params.set("schedule_type", activeSchedule);
        if (activeCompany) params.set("company", activeCompany);
        if (activeDatePosted) params.set("date_posted", activeDatePosted);
        if (activeFeeRange) {
          params.set("fee_min", String(activeFeeRange.min));
          if (activeFeeRange.max !== null) params.set("fee_max", String(activeFeeRange.max));
        }
        params.set("limit", "50");

        const res = await fetch(`/api/programs/public?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPrograms(data.programs || []);
          if (initialFilters.categories.length === 0 && initialFilters.companies.length === 0) {
            setInitialFilters(data.filters || { categories: [], cities: [], scheduleTypes: [], companies: [] });
          }
          setTotalResults(data.pagination?.total || 0);
          if (data.programs?.length > 0) {
            setSelectedProgram(data.programs[0]);
          } else {
            setSelectedProgram(null);
          }
        }
      } catch { /* ignore */ }
      setIsLoading(false);
    }
    fetchPrograms();
  }, [appliedSearch, appliedLocation, activeCategory, activeSchedule, activeCompany, activeDatePosted, activeFeeRange]);

  function handleSearch(e?: React.FormEvent) {
  e?.preventDefault();

  const params = new URLSearchParams();

  if (searchQuery) params.set("search", searchQuery);
  if (locationQuery) params.set("city", locationQuery);

  router.push(`/programs?${params.toString()}`);
}

  // Sort
  const sortedPrograms = useMemo(() => {
    if (sortBy === "date") {
      return [...programs].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return programs;
  }, [programs, sortBy]);

  const hasActiveFilters = activeCategory || activeSchedule || activeCompany || activeDatePosted || activeFeeRange || appliedSearch || appliedLocation;

  function clearFilters() {
    setActiveCategory("");
    setActiveSchedule("");
    setActiveCompany("");
    setActiveDatePosted("");
    setActiveFeeRange(null);
    setSearchQuery("");
    setLocationQuery("");
    setAppliedSearch("");
    setAppliedLocation("");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ═══════════ TOP NAVBAR ═══════════ */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo + nav */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <ThemeLogo className="h-10 sm:h-12 w-auto object-contain" />
              </Link>
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-sm font-semibold text-foreground border-b-2 border-[#008cff] border-opacity-0 hover:border-opacity-100 transition-colors"
                >
                  Home
                </Link>
              </nav>
            </div>

            {/* Right: Auth + Theme */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/signup?role=institution"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Institution / Post Program
              </Link>
              <div className="h-5 w-px bg-border hidden sm:block" />
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              {/* Theme toggle */}
              <button
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="p-2 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
  title="Toggle theme"
>
  {mounted ? (
    theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
  ) : (
    <div className="w-4 h-4" aria-hidden="true" />
  )}
</button>
              {/* Mobile menu toggle */}
              <button
                className="sm:hidden p-1.5 rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ MOBILE SIDEBAR ═══════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="absolute top-0 left-0 h-full w-64 bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Sidebar header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <ThemeLogo className="h-10 w-auto object-contain" />
              </Link>
              <button
                className="p-1.5 rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Sidebar nav */}
            <nav className="flex-1 py-3 px-3 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#008cff] bg-blue-50 dark:bg-blue-500/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/signup?role=institution" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Institution / Post Program
              </Link>
              <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}

     {/* ═══════════ HERO BANNER ═══════════ */}
<section className="relative w-full overflow-hidden bg-black">
  <div className="relative min-h-[580px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[640px] xl:min-h-[700px] flex flex-col justify-center">
    <video
      autoPlay
      muted
      loop
      playsInline
      src="/banner.mp4"
      aria-label="dakhla – Global Admissions Platform"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
    
    {/* Dark cinematic overlay */}
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

    {/* Content over banner */}
    <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-6 pt-20 pb-32 sm:py-24">
      {/* Heading */}
      <h1 className="text-[2.2rem] sm:text-4xl md:text-[3.2rem] lg:text-[3.6rem] font-bold text-white leading-[1.1] tracking-tight max-w-2xl">
        Find the right program{" "}
        <br className="hidden sm:block" />
        for your future
      </h1>

      {/* Search bar */}
      <div className="mt-8 sm:mt-10 max-w-[720px]">
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl sm:rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 flex-1 px-4 h-14 sm:h-[56px]">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search programs, institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-base sm:text-sm text-gray-800 outline-none placeholder:text-gray-400 min-w-0"
            />
          </div>
          
          {/* Location - Hidden on mobile to keep search bar clean */}
          <div className="hidden md:flex items-center gap-2 border-l border-gray-200 px-4 h-[56px] w-44">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="City"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 min-w-0"
            />
          </div>

          <Button
            type="submit"
            className="h-14 sm:h-[56px] px-5 sm:px-8 bg-[#008cff] hover:bg-[#0066cc] text-white font-bold sm:font-semibold shrink-0 rounded-none transition-all active:scale-95"
          >
            <Search className="w-6 h-6 sm:hidden" />
            <span className="hidden sm:inline text-sm">Find Programs</span>
          </Button>
        </form>
      </div>

      {/* Popular category pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2 max-w-[720px]">
        <span className="text-sm text-white/80 font-medium w-full mb-1 sm:w-auto sm:mb-0">Popular:</span>
        <div className="flex flex-wrap gap-2">
          {["Computer Science", "Engineering", "Pre-Primary", "Culinary"].map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/programs?category=${encodeURIComponent(cat)}`)}
              className="px-4 py-2 rounded-full text-[13px] font-medium text-white border border-white/30 bg-white/5 hover:bg-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              {cat} →
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Trusted by strip - Improved Responsive Layout */}
    <div className="absolute bottom-8 sm:bottom-10 inset-x-0 z-10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <span className="text-[11px] tracking-widest font-bold text-white/50">
           Popular Institutes:
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-10">
            {["NED", "KMDC", "NUST", "LUMS", "KGS"].map((inst) => (
              <span key={inst} className="text-white/90 text-lg sm:text-xl font-bold tracking-tight hover:text-white transition-colors cursor-default">
                {inst}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* ═══════════ TRUSTBAR CAROUSEL ═══════════ */}
      <Trustbar /> 

      {/* ═══════════ TESTIMONIALS CAROUSEL ═══════════ */}
      <TestimonialsSection />

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <ThemeLogo className="h-10 w-auto object-contain" />
            <span className="text-xs text-muted-foreground">© 2026 dakhla. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-[#008cff] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Reusable Detail Row ─── */
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{value}</p>
      </div>
    </div>
  );
}

/* ─── Testimonials Data ─── */
const TESTIMONIALS = [
  // Early Users / Beta Students
  { name: "Ayesha Khan", title: "Inter Student", city: "Karachi", category: "student", emoji: "🎓", quote: "I was so confused about where to apply after Intermediate. Dakhla made it very easy to compare institutions and see admission details in one place. I didn't have to visit multiple websites. It saved me so much time!" },
  { name: "Muhammad Hamza", title: "Matric Student", city: "Multan", category: "student", emoji: "🎓", quote: "Living in a smaller city, we don't always get timely admission updates. Through Dakhla, I found institutions I didn't even know were accepting applications. It really helped me explore more options." },
  { name: "Hira Ahmed", title: "Undergraduate Applicant", city: "Lahore", category: "student", emoji: "🎓", quote: "I work part-time and don't have time to search different university websites daily. Dakhla gave me admission information in one place and made applying very simple." },
  { name: "Ali Raza", title: "FSC Pre-Engineering", city: "Faisalabad", category: "student", emoji: "🎓", quote: "No one in my family had applied to universities before. Dakhla made the process less overwhelming. I could clearly see deadlines and requirements without confusion." },
  { name: "Mrs. Farah Siddiqui", title: "Parent", city: "Islamabad", category: "parent", emoji: "👩‍👧", quote: "As a parent, I wanted a safe and reliable platform to check admission information for my daughter. Dakhla felt organized and easy to understand." },
  // Skill-Based
  { name: "Usman Tariq", title: "Diploma in Graphic Design", city: "Karachi", category: "skill", emoji: "🎨", quote: "I wasn't interested in a traditional university degree. I wanted a practical skill. Through Dakhla, I found diploma programs that matched my interest in design. It made searching for skill-based institutes much easier." },
  { name: "Sana Javed", title: "Web Development Course", city: "Lahore", category: "skill", emoji: "💻", quote: "I wanted to learn web development but didn't know which institute to trust. Dakhla helped me explore different options and compare courses without confusion." },
  { name: "Bilal Ahmed", title: "Electrical Technician Course", city: "Faisalabad", category: "skill", emoji: "🔧", quote: "Not everyone wants a 4-year degree. I was looking for a technical course that could help me start earning faster. Dakhla showed me institutes offering skill-based programs near me." },
  { name: "Areeba Malik", title: "Makeup & Beautician Cert.", city: "Islamabad", category: "skill", emoji: "🎨", quote: "I wanted to pursue a professional certification instead of a university program. Dakhla helped me discover institutes offering certified beauty courses in my city." },
  { name: "Imran Shah", title: "Digital Marketing Course", city: "Multan", category: "skill", emoji: "🚀", quote: "After graduation, I realized I needed practical skills to compete in the job market. Dakhla helped me find short professional courses that aligned with my career goals." },
  // Culinary & Baking
  { name: "Zainab Iqbal", title: "Culinary Arts Applicant", city: "Lahore", category: "skill", emoji: "👩‍🍳", quote: "I always loved cooking and wanted to turn it into a profession. Through Dakhla, I found culinary institutes offering professional chef courses. It helped me take my passion seriously." },
  { name: "Hafsa Noor", title: "Baking & Pastry Cert.", city: "Karachi", category: "skill", emoji: "🍰", quote: "I wanted to start my own baking business but needed proper training. Dakhla helped me discover short baking courses in my city without spending hours searching online." },
  // Sports
  { name: "Ahmed Raza", title: "Sports Coaching Program", city: "Islamabad", category: "sports", emoji: "⚽", quote: "I've always been passionate about football but didn't know there were professional coaching certifications available. Dakhla helped me explore sports-related programs I never knew existed." },
  { name: "Saad Malik", title: "Fitness & Athletic Training", city: "Faisalabad", category: "sports", emoji: "🏏", quote: "Not everyone wants a traditional degree. I wanted to pursue sports and fitness professionally. Dakhla made it easy to find institutes offering certified training programs." },
  { name: "Maham Ali", title: "Sports Diploma", city: "Multan", category: "sports", emoji: "🎾", quote: "As a girl interested in sports, it's not always easy to find the right information. Dakhla helped me explore safe and professional options in sports education." },
];

const SNIPPET_QUOTES = [
  "Finally, a platform that makes admissions simple.",
  "Everything in one place. No confusion.",
  "Saved me hours of searching.",
  "Perfect for students who don't know where to start.",
  "Turn your passion into a profession.",
  "From kitchen to career — Dakhla made it simple.",
  "Sports isn't just a hobby. It can be your future.",
  "Not just degrees — real-world skills.",
];

const TESTIMONIAL_TABS = [
  { label: "All", value: "all" },
  { label: "⭐ Early Users", value: "student" },
  { label: "💡 Skill-Based", value: "skill" },
  { label: "🏆 Parents & Sports", value: "other" },
];

function TestimonialsSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") return TESTIMONIALS;
    if (activeTab === "other") return TESTIMONIALS.filter(t => t.category === "parent" || t.category === "sports");
    return TESTIMONIALS.filter(t => t.category === activeTab);
  }, [activeTab]);

  // Pages of 3
  const pageSize = 3;
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Auto-slide
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalPages);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, totalPages]);

  // Reset slide on tab change
  useEffect(() => { setCurrentSlide(0); }, [activeTab]);

  const currentTestimonials = filtered.slice(currentSlide * pageSize, currentSlide * pageSize + pageSize);

  return (
    <section
      className="bg-gradient-to-b from-background via-accent/30 to-background py-16 sm:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#008cff] dark:text-blue-400 text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-current" />
            What Students Say
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Trusted by Students Across Pakistan
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Real stories from real students who found their path through Dakhla.
          </p>
        </div>

        {/* Snippet Quotes Marquee */}
        <div className="mb-10 overflow-hidden relative">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...SNIPPET_QUOTES, ...SNIPPET_QUOTES].map((q, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-muted-foreground shrink-0"
              >
                <Quote className="w-3.5 h-3.5 text-[#008cff] shrink-0" />
                {q}
              </span>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {TESTIMONIAL_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab.value
                ? "bg-[#008cff] text-white shadow-md shadow-blue-600/20"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-blue-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 min-h-[280px]">
          {currentTestimonials.map((t, i) => (
            <div
              key={`${currentSlide}-${i}`}
              className="relative flex flex-col bg-card border border-border rounded-2xl p-7 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1.5 group animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Subtle background glow on hover */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-all duration-500 blur-3xl" />

              {/* Quote icon */}
              <div className="relative mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 flex items-center justify-center ring-1 ring-blue-500/10">
                  <Quote className="w-6 h-6 text-[#008cff]" />
                </div>
              </div>

              {/* Stars */}
              <div className="relative flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className="w-[18px] h-[18px] text-amber-400 fill-amber-400 drop-shadow-sm" />
                ))}
              </div>

              {/* Quote text */}
              <p className="relative text-[15px] text-foreground leading-relaxed mb-6 line-clamp-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author — pushed to bottom */}
              <div className="flex-1" />
              <div className="relative pt-5 border-t border-border/60">
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.title} · {t.city}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + totalPages) % totalPages)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === i
                    ? "w-8 bg-[#008cff]"
                    : "w-2.5 bg-border hover:bg-muted-foreground/50"
                    }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % totalPages)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}