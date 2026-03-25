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
  Calendar,
  Briefcase,
  BookOpen,
  Tag,
  Hash,
  Link2,
  SlidersHorizontal,
} from "lucide-react";

/* ─────────────── Types ─────────────── */
interface Program {
  id: number;
  title: string;
  institute_name?: string | null; // For platform-posted programs
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  className = "shrink-0"
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs sm:text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${
          isActive
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-white/10 dark:text-white dark:border-white/30 dark:hover:bg-white/20 dark:hover:border-white/50 backdrop-blur-sm"
        }`}
      >
        {icon}
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div 
          className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[10000] py-1 max-h-64 overflow-y-auto dark:bg-gray-800 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-auto">
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
  const [initialFilters, setInitialFilters] = useState<{
  categories: string[];
  cities: string[];
  companies: string[];
  scheduleTypes: string[]; // <--- Ye line lazmi add karein
}>({
  categories: [],
  cities: [],
  companies: [],
  scheduleTypes: [], // <--- Default empty array
});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // Ye filter toggle ke liye
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
  const [activeFeeRange, setActiveFeeRange] = useState<{
    label: string;
    min: number;
    max: number | null;
  } | null>(null);

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
          if (activeFeeRange.max !== null)
            params.set("fee_max", String(activeFeeRange.max));
        }
        params.set("limit", "50");

        const res = await fetch(`/api/programs/public?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPrograms(data.programs || []);
          if (
            initialFilters.categories.length === 0 &&
            initialFilters.companies.length === 0
          ) {
            setInitialFilters(
              data.filters || {
                categories: [],
                cities: [],
                scheduleTypes: [],
                companies: [],
              }
            );
          }
          setTotalResults(data.pagination?.total || 0);
          if (data.programs?.length > 0) {
            setSelectedProgram(data.programs[0]);
          } else {
            setSelectedProgram(null);
          }
        }
      } catch {
        /* ignore */
      }
      setIsLoading(false);
    }
    fetchPrograms();
  }, [
    appliedSearch,
    appliedLocation,
    activeCategory,
    activeSchedule,
    activeCompany,
    activeDatePosted,
    activeFeeRange,
  ]);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setAppliedSearch(searchQuery);
    setAppliedLocation(locationQuery);
  }

 // Sort (API se filtered data mil chuka hai, bas yahan sort kar rahe hain)
  const sortedPrograms = useMemo(() => {
    // [...programs] use karne se original array kharab nahi hoti
    const data = [...programs]; 
    
    if (sortBy === "date") {
      return data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }
    return data;
  }, [programs, sortBy]);

  const hasActiveFilters =
    activeCategory ||
    activeSchedule ||
    activeCompany ||
    activeDatePosted ||
    activeFeeRange ||
    appliedSearch ||
    appliedLocation;

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
  
 {/* Search bar */}
<div className="mt-6 sm:mt-8 mb-4 sm:mb-6 w-full max-w-5xl mx-auto px-3 sm:px-4">
  <form
    onSubmit={handleSearch}
    className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg"
  >
    {/* Search */}
    <div className="flex items-center gap-2 flex-1 px-4 h-12 sm:h-[52px]">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search programs, institutions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 min-w-0"
      />
    </div>

    {/* Location (hidden on mobile like before) */}
    <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 px-4 h-12 sm:h-[52px] w-44">
      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="City"
        value={locationQuery}
        onChange={(e) => setLocationQuery(e.target.value)}
        className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 min-w-0"
      />
    </div>

    {/* Button */}
    <Button
  type="submit"
  className="h-10 w-10 sm:h-11 sm:w-11 m-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shrink-0 flex items-center justify-center p-0"
>
  <Search className="w-5 h-5" />
</Button>
          
        </form>

<div className="h-6 w-full invisible"></div>

 {/* Filters Section */}
{showFilters && (
  <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 relative z-[60] pt-12 sm:pt-16">
  <div className="w-full overflow-x-auto no-scrollbar touch-pan-x">
    <div className="flex items-center gap-3 flex-nowrap min-w-max p-1">
              <h3 className="font-bold text-lg">Filter Programs</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                <select className="w-full p-2 rounded-md border bg-background text-sm" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {initialFilters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">City</label>
                <select className="w-full p-2 rounded-md border bg-background text-sm" value={appliedLocation} onChange={(e) => setAppliedLocation(e.target.value)}>
                  <option value="">All Cities</option>
                  {initialFilters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Fee */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Fee Range</label>
                <select className="w-full p-2 rounded-md border bg-background text-sm" onChange={(e) => {
                  const range = FEE_RANGES.find(r => r.label === e.target.value);
                  setActiveFeeRange(range || null);
                }}>
                  <option value="">Any Price</option>
                  {FEE_RANGES.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>Reset All</Button>
              <Button size="sm" className="bg-blue-600 text-white" onClick={() => setShowFilters(false)}>Show Results</Button>
            </div>
          </div>
        </div>
      )}
  {/* Mobile Scrollable Container */}
  <div className="w-full overflow-x-auto no-scrollbar touch-pan-x 
       /* Ye padding dropdowns ko jagah degi */
       pb-[250px] -mb-[250px]"> 
    
    <div className="flex items-center gap-2 flex-nowrap min-w-max">
        {/* Pay */}
        <FilterDropdown
          className="shrink-0"
          label={activeFeeRange ? activeFeeRange.label : "Pay"}
          icon={<DollarSign className="w-3.5 h-3.5" />}
          isActive={!!activeFeeRange}
        >
          <div className="pointer-events-auto"> {/* Extra safety for dropdown clicks */}
            <button onClick={() => setActiveFeeRange(null)} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
              All Fee Ranges
            </button>
            {FEE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => setActiveFeeRange(activeFeeRange?.label === range.label ? null : range)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeFeeRange?.label === range.label ? "text-blue-600 font-semibold" : ""}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Company */}
        <FilterDropdown
          className="shrink-0"
          label={activeCompany || "Company"}
          icon={<Building2 className="w-3.5 h-3.5" />}
          isActive={!!activeCompany}
        >
          <div className="pointer-events-auto">
            <button onClick={() => setActiveCompany("")} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
              All Companies
            </button>
            {initialFilters.companies.map((name: string) => (
              <button
                key={name}
                onClick={() => setActiveCompany(activeCompany === name ? "" : name)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent truncate ${activeCompany === name ? "text-blue-600 font-semibold" : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Program Type */}
        <FilterDropdown
          className="shrink-0"
          label={activeSchedule || "Program Type"}
          icon={<Briefcase className="w-3.5 h-3.5" />}
          isActive={!!activeSchedule}
        >
          <div className="pointer-events-auto">
            <button onClick={() => setActiveSchedule("")} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
              All Types
            </button>
            {initialFilters.scheduleTypes.map((st: string) => (
              <button
                key={st}
                onClick={() => setActiveSchedule(activeSchedule === st ? "" : st)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeSchedule === st ? "text-blue-600 font-semibold" : ""}`}
              >
                {st}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Category */}
        <FilterDropdown
          className="shrink-0"
          label={activeCategory || "Category"}
          icon={<GraduationCap className="w-3.5 h-3.5" />}
          isActive={!!activeCategory}
        >
          <div className="pointer-events-auto">
            <button onClick={() => setActiveCategory("")} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
              All Categories
            </button>
            {initialFilters.categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${activeCategory === cat ? "text-blue-600 font-semibold" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Location */}
        <FilterDropdown
          className="shrink-0"
          label={appliedLocation || "Location"}
          icon={<MapPin className="w-3.5 h-3.5" />}
          isActive={!!appliedLocation}
        >
          <div className="pointer-events-auto">
            <button
              onClick={() => { setLocationQuery(""); setAppliedLocation(""); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
            >
              All Locations
            </button>
            {initialFilters.cities.map((city: string) => (
              <button
                key={city}
                onClick={() => {
                  const next = appliedLocation === city ? "" : city;
                  setLocationQuery(next);
                  setAppliedLocation(next);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${appliedLocation === city ? "text-blue-600 font-semibold" : ""}`}
              >
                {city}
              </button>
            ))}
          </div>
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

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium ml-1 whitespace-nowrap shrink-0 pointer-events-auto"
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
                <span>
                  Programs in{" "}
                  <span className="text-blue-600 font-medium">
                    {appliedLocation}
                  </span>
                </span>
              ) : activeCompany ? (
                <span>
                  Programs by{" "}
                  <span className="text-blue-600 font-medium">
                    {activeCompany}
                  </span>
                </span>
              ) : (
                <span>All Programs</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {totalResults.toLocaleString()} result
                {totalResults !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-muted-foreground hidden sm:inline">
                  Sort by:
                </span>
                <button
                  onClick={() => setSortBy("relevance")}
                  className={`font-medium px-1 ${
                    sortBy === "relevance"
                      ? "text-blue-600 underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  relevance
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setSortBy("date")}
                  className={`font-medium px-1 ${
                    sortBy === "date"
                      ? "text-blue-600 underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No programs found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Try adjusting your search terms or filters to find more
                results.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 md:gap-5">
              {/* ── Left: Program Cards List ── */}
              <div
                className={`w-full md:w-[420px] lg:w-[460px] md:shrink-0 space-y-2 md:overflow-y-auto md:max-h-[calc(100vh-240px)] md:pr-1 ${
                  mobileView === "detail" ? "hidden md:block" : ""
                }`}
              >
                {sortedPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => {
                      setSelectedProgram(program);
                      setMobileView("detail");
                    }}
                    className={`group relative bg-card rounded-lg border p-3 sm:p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
                      selectedProgram?.id === program.id
                        ? "border-blue-500 shadow-md ring-1 ring-blue-500/30"
                        : "border-border hover:border-blue-300"
                    }`}
                  >
                    {/* Badge for featured or platform */}
                    {program.postedByPlatform ? (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-500/30">
                          ✦ Posted by DAKHLA
                        </span>
                      </div>
                    ) : program.institution.planTier
                        .toLowerCase()
                        .includes("featured") ? (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                          ★ Featured
                        </span>
                      </div>
                    ) : null}

                    <h3 className="text-sm sm:text-[15px] font-bold text-foreground leading-snug mb-1 pr-16 group-hover:text-blue-600 transition-colors">
                      {program.title}
                    </h3>

                   <p className="text-xs sm:text-[13px] text-muted-foreground mb-0.5">
  {program.postedByPlatform
    ? (program.institute_name || "DAKHLA Platform")
    : (program.institution?.name || "DAKHLA Platform")}
</p>

                    {!program.postedByPlatform &&
                      program.institution.city && (
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
              <div
                className={`flex-1 min-w-0 ${
                  mobileView === "list" ? "hidden md:block" : ""
                }`}
              >
                {/* Mobile back */}
                <button
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-blue-600 mb-3 cursor-pointer"
                  onClick={() => setMobileView("list")}
                >
                  ← Back to results
                </button>

              {selectedProgram ? (
                  <div className="bg-card border border-border rounded-lg md:sticky md:top-[60px] md:max-h-[calc(100vh-240px)] overflow-visible md:overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-border">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-1">
                        {selectedProgram.title}
                      </h2>

                      {/* Institute Name & Badge Logic */}
                      {selectedProgram.postedByPlatform ? (
                        <>
                          <p className="text-sm text-muted-foreground font-medium mb-1">
                            {selectedProgram.institute_name || "DAKHLA Platform"}
                          </p>
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-500/30">
                              ✦ Posted by DAKHLA Platform
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p
                            className="text-sm text-blue-600 font-medium flex items-center gap-1.5 mb-0.5 cursor-pointer hover:underline"
                            onClick={() =>
                              router.push(
                                `/institution-detail/${selectedProgram.institution.uniqueId}`
                              )
                            }
                          >
                            {selectedProgram.institution.name}
                            <ExternalLink className="w-3 h-3" />
                          </p>
                          {selectedProgram.institution.city && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {selectedProgram.institution.city}
                            </p>
                          )}
                        </>
                      )}

                      {/* Fee & Schedule */}
                      {selectedProgram.fee !== null && (
                        <p className="text-sm text-foreground font-medium mb-4">
                          {formatFee(selectedProgram.fee)}
                          {selectedProgram.schedule_type &&
                            ` · ${selectedProgram.schedule_type}`}
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
                          <DetailRow
                            icon={<Hash />}
                            label="Program Code"
                            value={selectedProgram.program_code}
                          />
                        )}
                        {selectedProgram.fee !== null && (
                          <DetailRow
                            icon={<DollarSign />}
                            label="Fee"
                            value={formatFee(selectedProgram.fee)}
                          />
                        )}
                        {selectedProgram.schedule_type && (
                          <DetailRow
                            icon={<Briefcase />}
                            label="Schedule Type"
                            value={selectedProgram.schedule_type}
                          />
                        )}
                        {selectedProgram.category && (
                          <DetailRow
                            icon={<Tag />}
                            label="Category"
                            value={selectedProgram.category}
                          />
                        )}
                        {selectedProgram.duration && (
                          <DetailRow
                            icon={<Clock />}
                            label="Duration"
                            value={selectedProgram.duration}
                          />
                        )}
                        {selectedProgram.study_field && (
                          <DetailRow
                            icon={<BookOpen />}
                            label="Study Field"
                            value={selectedProgram.study_field}
                          />
                        )}
                        {selectedProgram.eligibility && (
                          <DetailRow
                            icon={<Users />}
                            label="Eligibility"
                            value={selectedProgram.eligibility}
                          />
                        )}
                        {selectedProgram.application_method && (
                          <DetailRow
                            icon={<Link2 />}
                            label="Application Method"
                            value={
                              selectedProgram.application_method ===
                              "external"
                                ? "External Application"
                                : "Apply via GAP"
                            }
                          />
                        )}
                        {selectedProgram.external_url &&
                          selectedProgram.application_method ===
                            "external" && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-muted-foreground">
                                <ExternalLink />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  External Link
                                </p>
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
                              <p className="text-sm font-semibold text-foreground">
                                Application Deadline
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                {formatDate(selectedProgram.deadline)}
                              </p>
                            </div>
                          </div>
                        )}
                        <DetailRow
                          icon={<Calendar />}
                          label="Posted Date"
                          value={formatDate(selectedProgram.created_at)}
                        />
                        <DetailRow
                          icon={<Building2 />}
                          label={
                            selectedProgram.postedByPlatform
                              ? "Posted by"
                              : "Institution"
                          }
                          value={
                            selectedProgram.postedByPlatform
                              ? "DAKHLA Platform"
                              : `${selectedProgram.institution.name}${
                                  selectedProgram.institution.category
                                    ? ` · ${selectedProgram.institution.category}`
                                    : ""
                                }`
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex flex-col items-center justify-center h-80 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">
                      Select a program
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click on any program card to view its details here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <ThemeLogo className="h-10 w-auto object-contain" />
            <span className="text-xs text-muted-foreground">
              © 2026 dakhla. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/help"
              className="hover:text-blue-600 transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Reusable Detail Row ─── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
          {value}
        </p>
      </div>
    </div>
  );
}