"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
  institution: {
    id: number;
    name: string;
    city: string | null;
    category: string | null;
    profilePicture: string | null;
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
          : "bg-background text-foreground border-border hover:border-blue-400"
          }`}
      >
        {icon}
        {label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
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
    setAppliedSearch(searchQuery);
    setAppliedLocation(locationQuery);
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
                  className="px-3 py-1.5 text-sm font-semibold text-foreground border-b-2 border-blue-600"
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
                Employers / Post Program
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
                className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/signup?role=institution" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Employers / Post Program
              </Link>
              <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* ═══════════ SEARCH BAR ═══════════ */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 bg-background border border-border rounded-lg px-3 h-11 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Program title, keyword, or institution"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              />
            </div>
            <div className="flex items-center gap-2 sm:flex-initial sm:w-48 bg-background border border-border rounded-lg px-3 h-11 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="City"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              />
            </div>
            <Button
              type="submit"
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm shrink-0"
            >
              Find Programs
            </Button>
          </form>
        </div>
      </div>

      {/* ═══════════ FILTER CHIPS ═══════════ */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Pay / Fee Range */}
            <FilterDropdown
              label={activeFeeRange ? activeFeeRange.label : "Pay"}
              icon={<DollarSign className="w-3.5 h-3.5" />}
              isActive={!!activeFeeRange}
            >
              <button
                onClick={() => setActiveFeeRange(null)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                All Fee Ranges
              </button>
              {FEE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setActiveFeeRange(activeFeeRange?.label === range.label ? null : range)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${activeFeeRange?.label === range.label ? "text-blue-600 font-semibold" : ""}`}
                >
                  {range.label}
                </button>
              ))}
            </FilterDropdown>

            {/* Company / Institution */}
            <FilterDropdown
              label={activeCompany || "Company"}
              icon={<Building2 className="w-3.5 h-3.5" />}
              isActive={!!activeCompany}
            >
              <button
                onClick={() => setActiveCompany("")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                All Companies
              </button>
              {initialFilters.companies.map((name: string) => (
                <button
                  key={name}
                  onClick={() => setActiveCompany(activeCompany === name ? "" : name)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors truncate ${activeCompany === name ? "text-blue-600 font-semibold" : ""}`}
                >
                  {name}
                </button>
              ))}
            </FilterDropdown>

            {/* Job Type / Schedule */}
            <FilterDropdown
              label={activeSchedule || "Program Type"}
              icon={<Briefcase className="w-3.5 h-3.5" />}
              isActive={!!activeSchedule}
            >
              <button
                onClick={() => setActiveSchedule("")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                All Types
              </button>
              {initialFilters.scheduleTypes.map((st: string) => (
                <button
                  key={st}
                  onClick={() => setActiveSchedule(activeSchedule === st ? "" : st)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${activeSchedule === st ? "text-blue-600 font-semibold" : ""}`}
                >
                  {st}
                </button>
              ))}
            </FilterDropdown>

            {/* Category */}
            <FilterDropdown
              label={activeCategory || "Category"}
              icon={<GraduationCap className="w-3.5 h-3.5" />}
              isActive={!!activeCategory}
            >
              <button
                onClick={() => setActiveCategory("")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                All Categories
              </button>
              {initialFilters.categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${activeCategory === cat ? "text-blue-600 font-semibold" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </FilterDropdown>

            {/* Location */}
            <FilterDropdown
              label={appliedLocation || "Location"}
              icon={<MapPin className="w-3.5 h-3.5" />}
              isActive={!!appliedLocation}
            >
              <button
                onClick={() => { setLocationQuery(""); setAppliedLocation(""); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                All Locations
              </button>
              {initialFilters.cities.map((city: string) => (
                <button
                  key={city}
                  onClick={() => { const next = appliedLocation === city ? "" : city; setLocationQuery(next); setAppliedLocation(next); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${appliedLocation === city ? "text-blue-600 font-semibold" : ""}`}
                >
                  {city}
                </button>
              ))}
            </FilterDropdown>

            {/* Date Posted */}
            <FilterDropdown
              label={activeDatePosted ? DATE_POSTED_OPTIONS.find(o => o.value === activeDatePosted)?.label || "Date posted" : "Date posted"}
              icon={<Calendar className="w-3.5 h-3.5" />}
              isActive={!!activeDatePosted}
            >
              <button
                onClick={() => setActiveDatePosted("")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Any time
              </button>
              {DATE_POSTED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveDatePosted(activeDatePosted === opt.value ? "" : opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${activeDatePosted === opt.value ? "text-blue-600 font-semibold" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </FilterDropdown>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium ml-1 whitespace-nowrap shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">

          {/* Results header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">
              {appliedLocation ? (
                <span>Programs in <span className="text-blue-600 font-medium">{appliedLocation}</span></span>
              ) : activeCompany ? (
                <span>Programs by <span className="text-blue-600 font-medium">{activeCompany}</span></span>
              ) : (
                <span>All Programs</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-muted-foreground hidden sm:inline">Sort by:</span>
                <button
                  onClick={() => setSortBy("relevance")}
                  className={`font-medium px-1 ${sortBy === "relevance" ? "text-blue-600 underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`}
                >
                  relevance
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setSortBy("date")}
                  className={`font-medium px-1 ${sortBy === "date" ? "text-blue-600 underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`}
                >
                  date
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : programs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No programs found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Try adjusting your search terms or filters to find more results.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 md:gap-5">
              {/* ── Left: Program Cards List ── */}
              <div className={`w-full md:w-[420px] lg:w-[460px] md:shrink-0 space-y-2 md:overflow-y-auto md:max-h-[calc(100vh-240px)] md:pr-1 ${mobileView === "detail" ? "hidden md:block" : ""}`}>
                {sortedPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => { setSelectedProgram(program); setMobileView("detail"); }}
                    className={`group relative bg-card rounded-lg border p-3 sm:p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${selectedProgram?.id === program.id
                      ? "border-blue-500 shadow-md ring-1 ring-blue-500/30"
                      : "border-border hover:border-blue-300"
                      }`}
                  >
                    {/* Badge for featured */}
                    {program.institution.planTier.toLowerCase().includes("featured") && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                          ★ Featured
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm sm:text-[15px] font-bold text-foreground leading-snug mb-1 pr-16 group-hover:text-blue-600 transition-colors">
                      {program.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-muted-foreground mb-0.5">
                      {program.institution.name}
                    </p>

                    {program.institution.city && (
                      <p className="text-xs sm:text-[13px] text-muted-foreground mb-2">
                        {program.institution.city}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {program.fee !== null && (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs border border-border rounded-md px-2 py-0.5 text-foreground font-medium bg-accent/50">
                          {formatFee(program.fee)}
                        </span>
                      )}
                      {program.schedule_type && (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs border border-border rounded-md px-2 py-0.5 text-foreground font-medium bg-accent/50">
                          {program.schedule_type}
                        </span>
                      )}
                      {program.duration && (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs border border-border rounded-md px-2 py-0.5 text-muted-foreground bg-accent/50">
                          {program.duration}
                        </span>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground flex-wrap">
                      {program.deadline && (
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                          <Clock className="w-3 h-3" />
                          Deadline: {formatDate(program.deadline)}
                        </span>
                      )}
                      <span>Posted {timeAgo(program.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Right: Detail Panel ── */}
              <div className={`flex-1 min-w-0 ${mobileView === "list" ? "hidden md:block" : ""}`}>
                {/* Mobile back */}
                <button
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-blue-600 mb-3 cursor-pointer"
                  onClick={() => setMobileView("list")}
                >
                  ← Back to results
                </button>

                {selectedProgram ? (
                  <div className="bg-card border border-border rounded-lg md:sticky md:top-[60px] md:max-h-[calc(100vh-240px)] overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-border">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-1">
                        {selectedProgram.title}
                      </h2>
                      <p
                        className="text-sm text-blue-600 font-medium flex items-center gap-1.5 mb-0.5 cursor-pointer hover:underline"
                        onClick={() => router.push(`/institution-detail/${selectedProgram.institution.id}`)}
                      >
                        {selectedProgram.institution.name}
                        <ExternalLink className="w-3 h-3" />
                      </p>
                      {selectedProgram.institution.city && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {selectedProgram.institution.city}
                        </p>
                      )}
                      {selectedProgram.fee !== null && (
                        <p className="text-sm text-foreground font-medium mb-4">
                          {formatFee(selectedProgram.fee)}
                          {selectedProgram.schedule_type && ` · ${selectedProgram.schedule_type}`}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 sm:px-6 h-10 rounded-full shadow-sm"
                          onClick={() => router.push("/signup?role=student")}
                        >
                          Apply now
                        </Button>
                        <button
                          className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:border-blue-400 transition-colors text-muted-foreground hover:text-blue-600"
                          onClick={() => router.push("/login")}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 sm:px-6 py-4 sm:py-5">
                      <h3 className="text-base font-bold text-foreground mb-4">
                        Program details
                      </h3>

                      <div className="space-y-4">
                        {selectedProgram.program_code && (
                          <DetailRow icon={<Hash />} label="Program Code" value={selectedProgram.program_code} />
                        )}
                        {selectedProgram.fee !== null && (
                          <DetailRow icon={<DollarSign />} label="Fee" value={formatFee(selectedProgram.fee)} />
                        )}
                        {selectedProgram.schedule_type && (
                          <DetailRow icon={<Briefcase />} label="Schedule Type" value={selectedProgram.schedule_type} />
                        )}
                        {selectedProgram.category && (
                          <DetailRow icon={<Tag />} label="Category" value={selectedProgram.category} />
                        )}
                        {selectedProgram.duration && (
                          <DetailRow icon={<Clock />} label="Duration" value={selectedProgram.duration} />
                        )}
                        {selectedProgram.study_field && (
                          <DetailRow icon={<BookOpen />} label="Study Field" value={selectedProgram.study_field} />
                        )}
                        {selectedProgram.eligibility && (
                          <DetailRow icon={<Users />} label="Eligibility" value={selectedProgram.eligibility} />
                        )}
                        {selectedProgram.application_method && (
                          <DetailRow icon={<Link2 />} label="Application Method" value={selectedProgram.application_method === "external" ? "External Application" : "Apply via GAP"} />
                        )}
                        {selectedProgram.external_url && selectedProgram.application_method === "external" && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-muted-foreground">
                              <ExternalLink />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">External Link</p>
                              <a
                                href={selectedProgram.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {selectedProgram.external_url}
                              </a>
                            </div>
                          </div>
                        )}
                        {selectedProgram.deadline && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                              <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Application Deadline</p>
                              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{formatDate(selectedProgram.deadline)}</p>
                            </div>
                          </div>
                        )}
                        <DetailRow icon={<Calendar />} label="Posted Date" value={formatDate(selectedProgram.created_at)} />
                        <DetailRow icon={<Building2 />} label="Institution" value={`${selectedProgram.institution.name}${selectedProgram.institution.category ? ` · ${selectedProgram.institution.category}` : ""}`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex flex-col items-center justify-center h-80 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">Select a program</p>
                    <p className="text-sm text-muted-foreground">Click on any program card to view its details here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


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
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-blue-600 transition-colors">Help</Link>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
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
                <Quote className="w-3.5 h-3.5 text-blue-500 shrink-0" />
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
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
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
                  <Quote className="w-6 h-6 text-blue-500" />
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
                    ? "w-8 bg-blue-600"
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