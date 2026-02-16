// import Link from "next/link";
// import { Button } from "@/components/ui/button";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzR6TTIgMjBoMzR2Mkgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
//         <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
//           <div className="max-w-3xl">
//             <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-6">
//               <span className="text-sm font-medium">🇵🇰 Pakistan-first, Global-ready</span>
//             </div>
//             <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
//               Your Gateway to
//               <span className="block bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
//                 Global Admissions
//               </span>
//             </h1>
//             <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
//               Discover programs, apply to top institutions, and track your journey — all in one platform built for students and institutions.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Button
//                 size="lg"
//                 className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base px-8 h-12 rounded-xl shadow-lg"
//                 asChild
//               >
//                 <Link href="/signup">Get Started Free</Link>
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 rounded-xl"
//                 asChild
//               >
//                 <Link href="/login">Sign In</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-20 bg-white">
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">
//               One Platform, Three Roles
//             </h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Whether you&apos;re a student exploring options, an institution seeking talent, or an admin managing the ecosystem.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Student Card */}
//             <div className="group rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
//               <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
//                 🎓
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
//               <ul className="space-y-2 text-gray-600">
//                 <li className="flex items-center gap-2">
//                   <span className="text-blue-600">✓</span> Discover programs & institutions
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-blue-600">✓</span> Apply with one click
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-blue-600">✓</span> Track application status
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-blue-600">✓</span> Upload CV & profile
//                 </li>
//               </ul>
//             </div>

//             {/* Institution Card */}
//             <div className="group rounded-2xl border border-gray-200 p-8 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
//               <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
//                 🏫
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">For Institutions</h3>
//               <ul className="space-y-2 text-gray-600">
//                 <li className="flex items-center gap-2">
//                   <span className="text-emerald-600">✓</span> Post unlimited programs
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-emerald-600">✓</span> Receive & manage applications
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-emerald-600">✓</span> View student profiles
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-emerald-600">✓</span> Upgrade to Featured plan
//                 </li>
//               </ul>
//             </div>

//             {/* Admin Card */}
//             <div className="group rounded-2xl border border-gray-200 p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
//               <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
//                 🛡️
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">For Admins</h3>
//               <ul className="space-y-2 text-gray-600">
//                 <li className="flex items-center gap-2">
//                   <span className="text-purple-600">✓</span> Approve institutions
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-purple-600">✓</span> Verify payments
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-purple-600">✓</span> Manage categories & cities
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="text-purple-600">✓</span> Platform analytics
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-gray-400 py-12">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
//               G
//             </div>
//             <span className="text-lg font-bold text-white">GAP</span>
//           </div>
//           <p className="text-sm">
//             Global Admissions Platform — Pakistan-first, Global-ready
//           </p>
//           <p className="text-xs mt-2">© 2026 GAP. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 mb-6">
              <span className="text-sm font-medium text-blue-700">🇵🇰 Pakistan-first, Global-ready</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Education Admissions
              <span className="block text-blue-600 mt-2">
                Marketplace Platform
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover programs, apply to top institutions, and track your journey — all in one platform built for students and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-base px-8 h-12 shadow-sm"
                asChild
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base px-8 h-12"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-sm text-gray-600 font-medium">Active Programs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-sm text-gray-600 font-medium">Partner Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-sm text-gray-600 font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-sm text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              One Platform, Three Roles
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you&apos;re a student exploring options, an institution seeking talent, or an admin managing the ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Student Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mb-6">
                🎓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Dashboard</h3>
              <p className="text-gray-600 text-sm mb-6">
                Explore programs and manage your applications
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Search and discover programs worldwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Apply with one-click submission</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Track real-time application status</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Manage profile and upload documents</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                asChild
              >
                <Link href="/signup?role=student">Student Login</Link>
              </Button>
            </div>

            {/* Institution Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mb-6">
                🏫
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Institute Dashboard</h3>
              <p className="text-gray-600 text-sm mb-6">
                Manage programs and review applications
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Post and manage unlimited programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Receive and review applications</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Access detailed student profiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Upgrade to Featured visibility plan</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                asChild
              >
                <Link href="/signup?role=institution">Institute Login</Link>
              </Button>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Panel</h3>
              <p className="text-gray-600 text-sm mb-6">
                Oversee and manage the entire platform
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Approve institution registrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Verify payment transactions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Manage categories and locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm">Access platform analytics</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                asChild
              >
                <Link href="/admin">Admin Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up as a student or institution in seconds. Complete your profile with relevant information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explore & Connect</h3>
              <p className="text-gray-600">
                Browse programs or post opportunities. Use filters to find the perfect match for your goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Apply & Track</h3>
              <p className="text-gray-600">
                Submit applications or review candidates. Track everything in one centralized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students and institutions using GAP to connect and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-base px-8 h-12 shadow-sm"
              asChild
            >
              <Link href="/signup">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base px-8 h-12"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">GAP</h3>
                  <p className="text-xs text-gray-500">Global Admissions Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Pakistan-first, Global-ready education marketplace connecting students with institutions worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/programs" className="hover:text-blue-600">Browse Programs</Link></li>
                <li><Link href="/institutions" className="hover:text-blue-600">Institutions</Link></li>
                <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/faq" className="hover:text-blue-600">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2026 Global Admissions Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-blue-600">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
              <Link href="/cookies" className="hover:text-blue-600">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}