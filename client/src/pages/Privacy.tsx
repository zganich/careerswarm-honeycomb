export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐝</span>
            <span className="text-xl font-bold text-foreground">Careerswarm</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: January 22, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Careerswarm ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered career evidence platform. By using Careerswarm, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-foreground">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Name and email address (via OAuth providers)</li>
              <li>Login method (Google, GitHub, etc.)</li>
              <li>Profile information (current role, company, years of experience, target roles)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">2.2 Career Evidence Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use our platform, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Achievements (STAR stories, XYZ format, metrics, context)</li>
              <li>Skills and proficiency levels</li>
              <li>Job descriptions you analyze</li>
              <li>Generated resumes and cover letters</li>
              <li>Application tracking data (status, dates, notes)</li>
              <li>Interview preparation data (questions, practice answers)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">2.3 Payment Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              Payment processing is handled by Stripe. We do not store your credit card information. We only store your Stripe customer ID, subscription ID, and subscription status.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground mt-4">2.4 Usage Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent</li>
              <li>Features used and actions taken</li>
              <li>Error logs and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process your achievements using AI (STAR → XYZ transformation)</li>
              <li>Match your achievements to job descriptions</li>
              <li>Generate tailored resumes and cover letters</li>
              <li>Provide interview preparation and feedback</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications (application reminders, interview prep)</li>
              <li>Improve our platform and develop new features</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 We Do NOT Sell Your Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We will never sell, rent, or trade your personal information or career evidence data to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We share data with trusted service providers who help us operate our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Infrastructure:</strong> Hosting, authentication, and database</li>
              <li><strong>Stripe:</strong> Payment processing (PCI-compliant)</li>
              <li><strong>OpenAI/Anthropic:</strong> AI model providers for achievement transformation and job matching (data is not used for model training)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">4.3 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Encrypted database connections (TLS/SSL)</li>
              <li>JWT-based authentication with HTTP-only cookies</li>
              <li>CSRF protection on all forms</li>
              <li>Regular security audits and updates</li>
              <li>Role-based access control</li>
              <li>Secure password hashing (OAuth providers handle authentication)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Your Rights (GDPR & CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data for specific purposes</li>
              <li><strong>Restriction:</strong> Request limitation of processing under certain conditions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@careerswarm.com. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal data and career evidence within 90 days, except where retention is required by law (e.g., tax records, payment history).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Authentication:</strong> HTTP-only session cookies to keep you logged in</li>
              <li><strong>Analytics:</strong> Umami (privacy-friendly, GDPR-compliant) to track page views and feature usage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not use third-party advertising cookies or trackers. You can disable cookies in your browser settings, but this may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Careerswarm is not intended for users under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, contact us immediately at privacy@careerswarm.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">10. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be transferred to and processed in countries outside your jurisdiction. We ensure adequate safeguards are in place (e.g., Standard Contractual Clauses) to protect your data in accordance with GDPR and other applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or prominent notice on our platform. Continued use of Careerswarm after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>Email:</strong> privacy@careerswarm.com</li>
              <li><strong>Support:</strong> support@careerswarm.com</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              <span className="text-lg font-bold text-foreground">Careerswarm</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2026 Careerswarm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
