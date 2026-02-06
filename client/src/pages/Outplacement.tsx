import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Hexagon,
  Check,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Zap,
  ArrowRight,
  Building2,
  Heart,
  Shield,
} from "lucide-react";

export default function Outplacement() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    employeeCount: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend/email
    console.log("Outplacement inquiry:", formData);
    setSubmitted(true);
  };

  const packages = [
    {
      name: "Essential",
      price: "$99",
      per: "per employee",
      description: "Core job search support",
      features: [
        "3 months CareerSwarm Pro access",
        "AI-powered resume tailoring",
        "Unlimited applications",
        "Self-guided onboarding",
        "Email support",
      ],
      cta: "Best for 50+ employees",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$249",
      per: "per employee",
      description: "Comprehensive transition support",
      features: [
        "6 months CareerSwarm Pro access",
        "Everything in Essential",
        "Live group onboarding session",
        "Cover letter generation",
        "LinkedIn optimization",
        "Weekly progress reports",
        "Dedicated account manager",
      ],
      cta: "Most popular",
      highlighted: true,
    },
    {
      name: "Executive",
      price: "$499",
      per: "per employee",
      description: "White-glove career transition",
      features: [
        "12 months CareerSwarm Pro access",
        "Everything in Professional",
        "1:1 onboarding call",
        "Priority support",
        "Custom branding option",
        "Detailed analytics dashboard",
        "Placement tracking",
      ],
      cta: "For senior roles",
      highlighted: false,
    },
  ];

  const stats = [
    { value: "10x", label: "Faster applications" },
    { value: "73%", label: "Time saved per application" },
    { value: "4.8/5", label: "User satisfaction" },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Support your people",
      description:
        "Show employees you care about their next chapter with modern career tools.",
    },
    {
      icon: Clock,
      title: "Faster reemployment",
      description:
        "AI-powered applications mean your people find new roles faster.",
    },
    {
      icon: Shield,
      title: "Protect your brand",
      description:
        "Positive offboarding experiences protect your employer reputation.",
    },
    {
      icon: TrendingUp,
      title: "Measurable outcomes",
      description:
        "Track engagement, applications, and placements with real-time reporting.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2"
          >
            <Hexagon className="w-8 h-8 text-orange-500 fill-orange-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareerSwarm
            </span>
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLocation("/pricing")}
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              Individual Pricing
            </button>
            <Button
              onClick={() =>
                document
                  .getElementById("contact-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            Outplacement Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Support Your Team's
            <br />
            <span className="text-orange-500">Next Chapter</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Give departing employees AI-powered career tools that help them land
            their next role faster. Modern outplacement that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("contact-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-orange-500 hover:bg-orange-600"
            >
              Request a Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("packages")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-orange-500">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Why Companies Choose CareerSwarm
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Traditional outplacement is expensive and outdated. CareerSwarm
            delivers better outcomes at a fraction of the cost.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Share your employee list",
                description:
                  "Send us a CSV with names and emails. We'll handle the rest.",
              },
              {
                step: 2,
                title: "We onboard your team",
                description:
                  "Employees receive an invitation to set up their account and build their Master Profile.",
              },
              {
                step: 3,
                title: "AI powers their job search",
                description:
                  "They generate tailored resumes and cover letters for every application — in minutes, not hours.",
              },
              {
                step: 4,
                title: "Track progress & outcomes",
                description:
                  "You get a dashboard showing engagement, applications submitted, and placements.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Outplacement Packages
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12">
            Flexible options for teams of any size. Volume discounts available.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={
                  pkg.highlighted
                    ? "border-2 border-orange-500 shadow-xl relative"
                    : ""
                }
              >
                {pkg.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {pkg.cta}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {pkg.price}
                    </span>
                    <span className="text-slate-600 ml-2">{pkg.per}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.highlighted ? "default" : "outline"}
                    onClick={() =>
                      document
                        .getElementById("contact-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Get Quote
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 mt-8">
            Need a custom package? Volume discounts for 100+ employees.{" "}
            <button
              onClick={() =>
                document
                  .getElementById("contact-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-orange-600 hover:underline"
            >
              Contact us
            </button>
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Traditional vs. CareerSwarm Outplacement
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-900">Traditional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "$3,000-$10,000 per employee",
                  "Generic resume templates",
                  "Limited coaching sessions",
                  "Outdated job board access",
                  "No real-time tracking",
                  "3-6 month engagements",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-900">CareerSwarm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "$99-$499 per employee",
                  "AI-tailored resumes for every job",
                  "Unlimited application support",
                  "Modern, always-updated platform",
                  "Real-time analytics dashboard",
                  "Flexible 3-12 month access",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 px-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Get Started
          </h2>
          <p className="text-lg text-slate-600 text-center mb-8">
            Tell us about your needs and we'll send a custom quote within 24
            hours.
          </p>

          {submitted ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Thank you!
                </h3>
                <p className="text-slate-600">
                  We'll be in touch within 24 hours with a custom quote.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="Acme Inc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">
                        # of Affected Employees *
                      </Label>
                      <Input
                        id="employeeCount"
                        required
                        value={formData.employeeCount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeCount: e.target.value,
                          })
                        }
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Anything else we should know?
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Timeline, specific needs, questions..."
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Request Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Support Your Team?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join companies that are giving their people the best chance at
            landing their next role.
          </p>
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("contact-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
}
