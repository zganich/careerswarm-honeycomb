import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
              <span className="text-sm font-medium text-blue-700">
                Join 12,847 professionals building their career evidence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              From 15 Resume Fragments<br />
              <span className="text-blue-600">→ One Complete Career Story</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload every resume version you've ever created. We'll merge them into one powerful Master Profile that tells your complete career story.
            </p>
            
            <Link href="/onboarding">
              <a className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg">
                Build Your Master Profile
                <span>→</span>
              </a>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              🔒 End-to-end encrypted • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Career Archaeology Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🗂️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Merge 15+ Resume Versions
              </h3>
              <p className="text-gray-600">
                Every resume you've ever created contains unique achievements. We piece them together like career archaeology.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                96% Confidence Score
              </h3>
              <p className="text-gray-600">
                Cross-referenced evidence from multiple sources creates an unshakeable career narrative.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Apply in 45 Seconds
              </h3>
              <p className="text-gray-600">
                Tailored resume, personalized cover letter, and hiring manager outreach—all automated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Every Resume Version
                </h3>
                <p className="text-gray-600">
                  Drag and drop all your resume files (PDF, DOCX, TXT). We support up to 20 files.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Merges Your Career Timeline
                </h3>
                <p className="text-gray-600">
                  Watch in real-time as we extract roles, skills, and achievements from every file and merge duplicates.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Review Your Master Profile
                </h3>
                <p className="text-gray-600">
                  See your complete career story with confidence scores, gap analysis, and competitive advantages.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Apply to Jobs in 45 Seconds
                </h3>
                <p className="text-gray-600">
                  Paste any job description. Get a tailored resume, cover letter, and hiring manager outreach—instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Trusted by Professionals at
          </h2>
          
          <div className="flex justify-center items-center gap-12 mb-16 flex-wrap">
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Microsoft</div>
            <div className="text-2xl font-bold text-gray-400">Amazon</div>
            <div className="text-2xl font-bold text-gray-400">Meta</div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-700 mb-4">
                "I had 12 different resume versions scattered across Google Drive. CareerSwarm merged them into one master profile and I got 3 interviews in the first week."
              </p>
              <p className="text-sm font-semibold text-gray-900">Sarah Chen</p>
              <p className="text-sm text-gray-500">Senior Product Manager</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-700 mb-4">
                "The confidence score feature is genius. Seeing my career evidence cross-referenced gave me the confidence to apply for director-level roles."
              </p>
              <p className="text-sm font-semibold text-gray-900">Marcus Johnson</p>
              <p className="text-sm text-gray-500">Engineering Director</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Applied to 15 jobs in one afternoon. The AI tailoring is so good that hiring managers thought I custom-wrote each application."
              </p>
              <p className="text-sm font-semibold text-gray-900">Priya Patel</p>
              <p className="text-sm text-gray-500">Data Science Lead</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-50 to-orange-50 p-12 rounded-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Build Your Master Profile?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join 12,847 professionals who've already merged their career fragments into one complete story.
            </p>
            
            <Link href="/onboarding">
              <a className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg">
                Start Building Now
                <span>→</span>
              </a>
            </Link>
            
            <p className="text-sm text-gray-500 mt-6">
              ⏱️ Takes 3 minutes • 🔒 Encrypted • 💳 No credit card
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
