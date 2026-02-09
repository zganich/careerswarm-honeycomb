import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Careerswarm?",
    answer:
      "Careerswarm is an AI-powered career evidence platform that helps you transform your achievements into powerful, tailored resumes. Unlike traditional resume builders, we help you build a Master Profile of your career evidence using the STAR methodology, then generate optimized resumes for each job you apply to.",
  },
  {
    question: "How is this different from other resume builders?",
    answer:
      "Most resume builders are just formatting tools. Careerswarm focuses on the quality of your content first. We use the Google XYZ format and STAR methodology to help you capture achievements with metrics and impact. For tech and engineering roles we emphasize the Google XYZ formula; for other roles we use a similar quantified CAR (Context–Action–Result) structure. Our Impact Meter gives you real-time feedback on achievement quality, and our AI matches your best evidence to each job description automatically.",
  },
  {
    question: "What is the STAR methodology?",
    answer:
      "STAR stands for Situation, Task, Action, Result. It's a proven framework for capturing complete achievement stories. Our wizard walks you through each step, prompting you to add specific metrics and context. This ensures your achievements are concrete, verifiable, and impressive to recruiters.",
  },
  {
    question: "What is the Google XYZ format?",
    answer:
      "The XYZ format is Google's recommended achievement structure: 'Accomplished [X] as measured by [Y] by doing [Z]'. For tech and engineering roles, our AI transforms your STAR stories into this format. For other industries we use a similar quantified CAR (Context–Action–Result) structure. Both are proven to pass ATS systems and catch recruiter attention.",
  },
  {
    question: "How does the Impact Meter work?",
    answer:
      "The Impact Meter scores your achievements based on three criteria: strong action verbs (+10%), quantifiable metrics (+40%), and clear methodology/skills (+50%). As you add these elements, your score rises. The goal is to get every achievement to 80-100% (green) for maximum impact.",
  },
  {
    question: "Can I upload my existing resume?",
    answer:
      "Currently, you'll need to manually enter your achievements using our STAR wizard. We're working on a resume upload feature for v2.0 that will automatically parse your existing resumes and extract achievements. For now, the manual entry process helps ensure high-quality, structured data.",
  },
  {
    question: "How many resumes can I generate?",
    answer:
      "Free tier users can generate up to 3 resumes per month. Pro tier users ($29/month) get unlimited resume generation. Each resume is tailored to a specific job description, so you can apply to multiple roles with optimized resumes.",
  },
  {
    question: "What's included in the Free tier?",
    answer:
      "Free tier includes: 10 achievements, 3 resumes per month, STAR wizard, Impact Meter, basic job matching, and interview prep. This is perfect for testing the platform or if you're applying to a few select roles.",
  },
  {
    question: "What's included in the Pro tier?",
    answer:
      "Pro tier ($29/month) includes: unlimited achievements, unlimited resumes, advanced job matching, auto-qualification, tailored cover letters, interview prep with AI feedback, application tracking, and priority support. Best for active job seekers.",
  },
  {
    question: "Do you store my personal data?",
    answer:
      "Yes, we store your achievements, resumes, and application data in a secure database. We use industry-standard encryption and never share your data with third parties. You can export or delete your data at any time. See our Privacy Policy for full details.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use JWT-based authentication, HTTP-only cookies, encrypted database connections, and follow OWASP security best practices. Your payment information is handled by Stripe (PCI-compliant) and never touches our servers.",
  },
  {
    question: "Can I cancel my Pro subscription?",
    answer:
      "Yes, you can cancel anytime from your Dashboard → Profile → Subscription. Your Pro features will remain active until the end of your billing period. No refunds for partial months, but you keep access until the period ends.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 7-day money-back guarantee for first-time Pro subscribers. If you're not satisfied within the first 7 days, contact support for a full refund. After 7 days, no refunds are provided, but you can cancel to avoid future charges.",
  },
  {
    question: "How does job matching work?",
    answer:
      "Paste any job description into our system. Our AI extracts required skills, responsibilities, and success metrics, then matches your achievements to those requirements. You get a fit percentage, matched skills, missing skills, and reasoning for why you're a good (or not-so-good) match.",
  },
  {
    question: "What is auto-qualification?",
    answer:
      "Auto-qualification is a Pro feature where our AI analyzes job descriptions and automatically determines if you're a strong fit (70%+), moderate fit (50-69%), or weak fit (<50%). This saves you time by helping you focus on the best opportunities.",
  },
  {
    question: "Can I track my applications?",
    answer:
      "Yes! Pro users get a full application tracking system with 9 stages: draft, applied, phone screen, technical interview, onsite interview, offer, accepted, rejected, withdrawn. We also send follow-up reminders 7 days after applying and interview prep reminders 2 days before interviews.",
  },
  {
    question: "Do you help with cover letters?",
    answer:
      "Yes, Pro users can generate tailored cover letters for each application. Our AI uses your matched achievements and the job description to create a compelling narrative that shows why you're the perfect fit.",
  },
  {
    question: "What about interview preparation?",
    answer:
      "We generate likely interview questions based on the job description, then help you practice answers using your achievement evidence. Pro users get AI feedback on their practice answers, plus follow-up question generation to simulate real interviews.",
  },
  {
    question: "Is this ATS-friendly?",
    answer:
      "Yes! We use ATS-safe formatting (no tables, no images, Arial/Calibri fonts, semantic keywords). We optimize achievement phrasing by role: Google XYZ for tech and engineering, and CAR (Context–Action–Result) for other roles—both tuned for ATS parsing and human readability. Resumes are designed for compatibility with major ATS systems like Taleo, Workday, and Greenhouse. Each application package shows an ATS keyword match score so you can see how well your resume aligns with the job description.",
  },
  {
    question: "Can I export my resumes?",
    answer:
      "Yes, you can export resumes as PDF or DOCX. PDFs are recommended for final submission (better formatting preservation), while DOCX is useful if you need to make manual edits.",
  },
  {
    question: "Do you offer team/enterprise plans?",
    answer:
      "Not yet, but we're working on B2B features for career coaches, universities, and outplacement firms. If you're interested in a team plan, contact us at support@careerswarm.com to join the waitlist.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users can access our FAQ and documentation. Pro users get priority email support (support@careerswarm.com) with 24-hour response time. We're also building a community forum for peer support.",
  },
  {
    question: "Can I suggest features?",
    answer:
      "Absolutely! We're actively building based on user feedback. Email your suggestions to feedback@careerswarm.com or use the feedback form in your Dashboard. Top-requested features get prioritized in our roadmap.",
  },
  {
    question: "What's on your roadmap?",
    answer:
      "v2.0 (3-6 months): Multi-resume upload & parsing, Career evidence dashboard with visual analytics. v2.1 (6-9 months): Verification guardrails, Cultural adaptation UI. v3.0 (9-12 months): Resume version comparison, Advanced analytics.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground text-sm font-medium mb-6">
            <span>❓</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Got Questions? We've Got Answers.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Careerswarm, from features to
            pricing to security.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-accent/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-accent/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Still Have Questions?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Reach out to our support team.
          </p>
          <a
            href="mailto:support@careerswarm.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
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
