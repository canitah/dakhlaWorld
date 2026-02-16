import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzR6TTIgMjBoMzR2Mkgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-6">
              <span className="text-sm font-medium">🇵🇰 Pakistan-first, Global-ready</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Your Gateway to
              <span className="block bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                Global Admissions
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              Discover programs, apply to top institutions, and track your journey — all in one platform built for students and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base px-8 h-12 rounded-xl shadow-lg"
                asChild
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 rounded-xl"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              One Platform, Three Roles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re a student exploring options, an institution seeking talent, or an admin managing the ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="group rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🎓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Discover programs & institutions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Apply with one click
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Track application status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Upload CV & profile
                </li>
              </ul>
            </div>

            {/* Institution Card */}
            <div className="group rounded-2xl border border-gray-200 p-8 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🏫
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Institutions</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Post unlimited programs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Receive & manage applications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> View student profiles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Upgrade to Featured plan
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="group rounded-2xl border border-gray-200 p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Admins</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Approve institutions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Verify payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Manage categories & cities
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Platform analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <span className="text-lg font-bold text-white">GAP</span>
          </div>
          <p className="text-sm">
            Global Admissions Platform — Pakistan-first, Global-ready
          </p>
          <p className="text-xs mt-2">© 2026 GAP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
