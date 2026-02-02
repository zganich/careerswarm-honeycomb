import { useLocation } from 'wouter';
import { Hexagon, Users, Target, Clock, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function Recruiters() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setLocation('/')} className="flex items-center space-x-2 cursor-pointer">
            <Hexagon className="w-8 h-8 text-orange-500 fill-orange-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900">CareerSwarm</span>
          </button>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation('/')}
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              ← Back to Home
            </button>
            <button 
              onClick={() => setLocation('/pricing')}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-lg"
            >
              View Pricing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            For Talent Acquisition Teams
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Find Candidates Who <span className="text-orange-500">Actually Stand Out</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            CareerSwarm helps job seekers create <strong>quantified, ATS-optimized applications</strong> that make your screening process faster and more effective.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setLocation('/pricing')}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl transition-all shadow-lg"
            >
              Partner With Us
            </button>
            <button 
              onClick={() => window.location.href = 'mailto:partnerships@careerswarm.com'}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-lg font-medium rounded-xl border-2 border-slate-200 transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
            Why Recruiters Love CareerSwarm Candidates
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quantified Achievements</h3>
              <p className="text-slate-700">
                Every CareerSwarm resume includes specific metrics and outcomes. No more vague "responsible for" statements—just measurable impact.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ATS-Optimized Format</h3>
              <p className="text-slate-700">
                Applications are structured for easy parsing by your ATS. Clean formatting, proper keywords, and scannable sections save your team hours.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Faster Screening</h3>
              <p className="text-slate-700">
                Consistent formatting and clear achievement statements let you evaluate candidates 3x faster. Spend less time decoding resumes.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Higher Quality Pool</h3>
              <p className="text-slate-700">
                Candidates using CareerSwarm are serious about their applications. They've invested time building comprehensive profiles.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Better Candidate Experience</h3>
              <p className="text-slate-700">
                Candidates arrive prepared with tailored materials. This means better interviews and stronger hires who understand your company.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Outreach</h3>
              <p className="text-slate-700">
                CareerSwarm users proactively reach out to hiring managers with personalized messages—reducing your sourcing burden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Upgrade Your Talent Pipeline?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Partner with CareerSwarm to receive higher-quality applications and reduce screening time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.href = 'mailto:partnerships@careerswarm.com?subject=Recruiter Partnership Inquiry'}
              className="px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-xl hover:bg-orange-50 transition-all shadow-lg"
            >
              Contact Partnerships Team
            </button>
            <button 
              onClick={() => setLocation('/pricing')}
              className="px-8 py-4 bg-orange-700 hover:bg-orange-800 text-white text-lg font-medium rounded-xl transition-all"
            >
              View Enterprise Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-slate-400 text-center">
        <p className="text-sm">
          © 2026 CareerSwarm. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
