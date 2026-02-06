export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐝</span>
            <span className="text-xl font-bold text-foreground">
              Careerswarm
            </span>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-12">
          Last updated: January 22, 2026
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Careerswarm ("the Service"), you agree to be
              bound by these Terms of Service ("Terms"). If you do not agree to
              these Terms, do not use the Service. We reserve the right to
              modify these Terms at any time, and your continued use constitutes
              acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Careerswarm is an AI-powered career evidence platform that helps
              users capture achievements, generate tailored resumes, match job
              opportunities, and prepare for interviews. The Service includes
              both free and paid subscription tiers with varying feature access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              3. User Accounts
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              3.1 Account Creation
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must create an account to use the Service. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              3.2 Account Eligibility
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 16 years old to use the Service. By creating
              an account, you represent that you meet this age requirement.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground mt-4">
              3.3 Account Termination
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time for violation of these Terms, fraudulent activity, or any
              other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              4. Subscription and Payment
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              4.1 Free Tier
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Free tier includes: 10 achievements, 3 resumes per month, STAR
              wizard, Impact Meter, basic job matching, and interview prep. Free
              tier limits are enforced and reset monthly.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              4.2 Pro Tier
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Pro tier ($29/month) includes: unlimited achievements,
              unlimited resumes, advanced job matching, auto-qualification,
              tailored cover letters, interview prep with AI feedback,
              application tracking, and priority support.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              4.3 Billing
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pro subscriptions are billed monthly in advance. Payment is
              processed by Stripe. You authorize us to charge your payment
              method on a recurring basis until you cancel.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              4.4 Cancellation
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may cancel your Pro subscription at any time from your
              Dashboard → Profile → Subscription. Cancellation takes effect at
              the end of the current billing period. You will retain Pro access
              until that date.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              4.5 Refunds
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 7-day money-back guarantee for first-time Pro
              subscribers. If you are not satisfied within the first 7 days,
              contact support@careerswarm.com for a full refund. After 7 days,
              no refunds are provided for partial months. Cancellation prevents
              future charges but does not refund the current billing period.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground mt-4">
              4.6 Price Changes
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to change subscription prices at any time.
              Existing subscribers will be notified 30 days in advance of any
              price increase. Continued use after the price change constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              5. User Content and Ownership
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              5.1 Your Content
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of all achievements, resumes, and other
              content you create using the Service ("User Content"). By using
              the Service, you grant us a limited, non-exclusive, worldwide
              license to use, store, and process your User Content solely to
              provide and improve the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              5.2 Content Accuracy
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are solely responsible for the accuracy and truthfulness of
              your User Content. You represent that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>All achievements and metrics are truthful and verifiable</li>
              <li>You have the right to share all information you provide</li>
              <li>Your content does not infringe on any third-party rights</li>
              <li>Your content does not violate any laws or regulations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              5.3 Prohibited Content
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to create or share content that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Contains false, misleading, or fraudulent information</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Violates privacy or confidentiality obligations</li>
              <li>Contains malware, viruses, or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              6. AI-Generated Content
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              6.1 AI Assistance
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service uses AI to transform achievements (STAR → XYZ), match
              job descriptions, generate resumes, and provide interview
              feedback. AI-generated content is provided "as is" and may contain
              errors or inaccuracies.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              6.2 Your Responsibility
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for reviewing and editing all AI-generated
              content before use. We do not guarantee the accuracy, quality, or
              suitability of AI outputs. You should verify all information and
              ensure it accurately represents your experience.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground mt-4">
              6.3 No Guarantee of Results
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              While our AI is designed to improve resume quality and job
              matching, we do not guarantee that using the Service will result
              in job interviews, offers, or employment. Career outcomes depend
              on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              7. Acceptable Use Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Scrape, crawl, or harvest data from the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Create multiple accounts to circumvent usage limits</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to spam or harass others</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              8. Intellectual Property
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              8.1 Our IP
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service, including its design, code, algorithms, branding, and
              content (excluding User Content), is owned by Careerswarm and
              protected by copyright, trademark, and other intellectual property
              laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              8.2 Limited License
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to
              access and use the Service for your personal career development
              purposes, subject to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              9. Disclaimers
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              9.1 "As Is" Service
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
              LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              9.2 No Guarantee
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We do not guarantee that the Service will be uninterrupted,
              error-free, or secure. We do not guarantee any specific results
              from using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAREERSWARM SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE,
              ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE, EVEN IF
              WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL
              LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS
              PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              11. Indemnification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Careerswarm, its
              affiliates, and their respective officers, directors, employees,
              and agents from any claims, liabilities, damages, losses, and
              expenses (including legal fees) arising out of or related to: (a)
              your use of the Service, (b) your User Content, (c) your violation
              of these Terms, or (d) your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              12. Dispute Resolution
            </h2>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              12.1 Informal Resolution
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have a dispute, please contact us at
              support@careerswarm.com first. We will attempt to resolve disputes
              informally within 30 days.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              12.2 Arbitration
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If informal resolution fails, disputes will be resolved through
              binding arbitration in accordance with the rules of the American
              Arbitration Association. You waive your right to a jury trial or
              to participate in a class action lawsuit.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              12.3 Governing Law
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the State of Delaware,
              USA, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              13. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. We will notify you of
              material changes by email or prominent notice on the Service. Your
              continued use after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              14. Severability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid or
              unenforceable, the remaining provisions will remain in full force
              and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              15. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms, contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li>
                <strong>Email:</strong> legal@careerswarm.com
              </li>
              <li>
                <strong>Support:</strong> support@careerswarm.com
              </li>
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
              <span className="text-lg font-bold text-foreground">
                Careerswarm
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              <a
                href="/pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="/faq"
                className="hover:text-foreground transition-colors"
              >
                FAQ
              </a>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
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
