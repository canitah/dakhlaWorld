import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FeaturedPrograms from "@/components/featured-programs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* ══════════════════════════════════════════════════════
          HERO SECTION — Split layout with gradient + image
          ══════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Pakistan-first, Global-ready
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-6">
                Find Your Path to
                <span className="relative">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mt-1">
                    Education Excellence
                  </span>
                  {/* Underline decoration */}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="url(#hero-underline)" strokeWidth="3" strokeLinecap="round" />
                    <defs><linearGradient id="hero-underline" x1="0" y1="0" x2="300" y2="0"><stop stopColor="#3b82f6" stopOpacity="0.6" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Discover programs, apply to top institutions, and track your
                journey — all in one platform built for students and
                institutions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-base px-8 h-12 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent font-semibold text-base px-8 h-12 rounded-xl"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {["S", "A", "J", "M"][i - 1]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">10K+</span> students
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    <span className="font-semibold text-foreground">4.9</span>/5 rating
                  </span>
                </div>
              </div>
            </div>

            {/* Right — Hero Image with floating UI elements */}
            <div className="relative hidden lg:block">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-400/10 rounded-3xl blur-3xl scale-90" />

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/10">
                <Image
                  src="/hero-dashboard.png"
                  alt="dazla. platform dashboard"
                  width={700}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Glass overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
              </div>

              {/* Floating stat card — top right */}
              <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 shadow-lg animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Applications</p>
                    <p className="text-sm font-bold text-foreground">+24% this week</p>
                  </div>
                </div>
              </div>

              {/* Floating notification — bottom left */}
              <div className="absolute -bottom-4 -left-6 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 shadow-lg animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Just now</p>
                    <p className="text-sm font-bold text-foreground">Application accepted!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR — Animated counters in a floating bar
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-8 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Active Programs", icon: "📚" },
                { value: "150+", label: "Partner Institutions", icon: "🏫" },
                { value: "10K+", label: "Active Students", icon: "🎓" },
                { value: "95%", label: "Success Rate", icon: "🏆" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED PROGRAMS — Existing component
          ══════════════════════════════════════════════════════ */}
      <FeaturedPrograms />

      {/* ══════════════════════════════════════════════════════
          FEATURES — Bento grid with icons & glassmorphism
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 mb-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Platform Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              One Platform, Three Powerful Roles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re a student exploring options, an institution seeking talent, or an admin managing the ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="group relative bg-card rounded-2xl border border-border p-8 hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Student Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-6">Explore programs and manage your applications effortlessly.</p>
                <ul className="space-y-3 mb-8">
                  {["Search & discover programs worldwide", "One-click application submission", "Real-time status tracking", "Upload CV & manage profile"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold h-11" asChild>
                  <Link href="/signup?role=student">
                    Get Started as Student
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Institution Card — FEATURED */}
            <div className="group relative bg-card rounded-2xl border-2 border-blue-500/30 p-8 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-lg shadow-blue-500/5">
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  Popular
                </span>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Institute Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-6">Manage programs and review applications from one place.</p>
                <ul className="space-y-3 mb-8">
                  {["Post & manage unlimited programs", "Receive & review applications", "Access detailed student profiles", "Upgrade to Featured visibility"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 shadow-lg shadow-blue-600/25" asChild>
                  <Link href="/signup?role=institution">
                    Register Your Institute
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Card */}
            <div className="group relative bg-card rounded-2xl border border-border p-8 hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Admin Panel</h3>
                <p className="text-sm text-muted-foreground mb-6">Oversee and manage the entire platform ecosystem.</p>
                <ul className="space-y-3 mb-8">
                  {["Approve institution registrations", "Verify payment transactions", "Manage categories & locations", "Platform-wide analytics"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold h-11" asChild>
                  <Link href="/admin">
                    Admin Access
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — Timeline / stepped process
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 mb-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps — it takes less than 2 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up as a student or institution in seconds. Complete your profile with relevant information.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ),
              },
              {
                step: "02",
                title: "Explore & Connect",
                desc: "Browse programs or post opportunities. Use advanced filters to find your perfect match.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                ),
              },
              {
                step: "03",
                title: "Apply & Track",
                desc: "Submit applications or review candidates. Track everything in one centralized dashboard.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                ),
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative text-center">
                {/* Connecting line (hidden on last item and mobile) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                )}

                {/* Step number + icon circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex items-center justify-center mx-auto group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300">
                    <div className="text-blue-500">{item.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-600/30">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SOCIAL PROOF — Image+ testimonial strip
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/hero-students.png"
                alt="Students using dazla."
                width={640}
                height={420}
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 mb-4">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Why Choose dazla.</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight">
                Trusted by Students &<br />Institutions Nationwide
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our platform connects ambitious students with top institutions across Pakistan and beyond. With advanced matching, real-time tracking, and seamless applications, we&apos;re transforming how education admissions work.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: "⚡", title: "Instant Apply", desc: "One-click applications" },
                  { icon: "🔒", title: "Secure", desc: "Enterprise-grade security" },
                  { icon: "📊", title: "Analytics", desc: "Real-time insights" },
                  { icon: "🌍", title: "Global Ready", desc: "Connect worldwide" },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA SECTION — Gradient banner
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-card border-t border-border relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students and institutions using dazla. to connect, grow, and achieve their educational goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-base px-10 h-13 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              asChild
            >
              <Link href="/signup">
                Create Free Account
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-accent font-semibold text-base px-10 h-13 rounded-xl"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Free plan available · Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER — Modern multi-column
          ══════════════════════════════════════════════════════ */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.jpeg" alt="dazla." className="h-10 w-auto object-contain" />
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
                Pakistan-first, Global-ready education marketplace connecting students with institutions worldwide. Empowering the next generation of learners.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {["M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                  "M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.06s.92-2.06 2.06-2.06 2.06.93 2.06 2.06-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z",
                ].map((path, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/programs" className="hover:text-blue-500 transition-colors">Browse Programs</Link></li>
                <li><Link href="/institutions" className="hover:text-blue-500 transition-colors">Institutions</Link></li>
                <li><Link href="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 dazla. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-blue-500 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}