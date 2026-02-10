import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Hexagon, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatTRPCError } from "@/lib/error-formatting";

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in (don't treat loading as signed-out)
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery(
    undefined,
    { retry: 1, refetchOnMount: "always" }
  );

  const loginReturnTo = encodeURIComponent("/pricing?upgrade=pro");

  // Stripe checkout mutation
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: data => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setIsLoading(false);
        toast.error(
          "Checkout link unavailable—please try again or contact support"
        );
      }
    },
    onError: error => {
      console.error("Checkout error:", error);
      setIsLoading(false);
      const code = (error as { data?: { code?: string } })?.data?.code;
      if (code === "UNAUTHORIZED" || error.message?.includes("UNAUTHORIZED")) {
        setLocation(`/login?returnTo=${loginReturnTo}`);
      } else {
        const formatted = formatTRPCError(error);
        toast.error(formatted.message);
      }
    },
  });

  const handleProClick = () => {
    if (authLoading) return; // wait for auth to resolve
    if (!user) {
      setLocation(`/login?returnTo=${loginReturnTo}`);
      return;
    }
    setIsLoading(true);
    checkoutMutation.mutate({});
  };

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing CareerSwarm",
      features: [
        "1 Master Profile",
        "5 applications per month",
        "Basic resume tailoring",
        "Email support",
        "ATS optimization",
      ],
      cta: "Start Free",
      highlighted: false,
      action: () => setLocation("/roast"),
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For active job seekers",
      features: [
        "Unlimited Master Profiles",
        "Unlimited applications",
        "Advanced AI tailoring",
        "Priority support",
        "ATS optimization",
        "Cover letter generation",
        "LinkedIn message templates",
        "Application tracking",
        "Interview prep materials",
      ],
      cta: authLoading
        ? "Checking sign-in…"
        : isLoading
          ? "Loading..."
          : "Start Pro Trial",
      highlighted: true,
      action: handleProClick,
      isLoading: isLoading || authLoading,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom branding",
        "Dedicated account manager",
        "API access",
        "SSO integration",
        "Advanced analytics",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
      action: () => {
        window.location.href = "mailto:sales@careerswarm.com";
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
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
            {authLoading ? (
              <span className="text-sm text-slate-500">Checking sign-in…</span>
            ) : user ? (
              <button
                onClick={() => setLocation("/dashboard")}
                className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setLocation("/login?returnTo=/pricing")}
                className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                Sign In
              </button>
            )}
            <Button onClick={() => setLocation("/roast")}>Get Roasted</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the plan that fits your job search goals
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map(tier => (
            <Card
              key={tier.name}
              className={
                tier.highlighted
                  ? "border-2 border-orange-500 shadow-xl relative"
                  : ""
              }
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-slate-600 ml-2">/ {tier.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map(feature => (
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
                  variant={tier.highlighted ? "default" : "outline"}
                  onClick={tier.action}
                  disabled={tier.isLoading}
                >
                  {tier.isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600">
                Yes! You can cancel your subscription at any time. No questions
                asked, no hidden fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600">
                We accept all major credit cards (Visa, Mastercard, American
                Express) and PayPal.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600">
                Yes! Pro plan includes a 7-day free trial. No credit card
                required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-slate-600">
                Your Master Profile and application history remain accessible
                for 30 days after cancellation. You can export your data at any
                time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Do you offer discounts for students or nonprofits?
              </h3>
              <p className="text-slate-600">
                Yes! We offer 50% off Pro plans for students and nonprofit
                employees. Contact us at support@careerswarm.com with proof of
                eligibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of professionals who've automated their applications
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/roast")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Get Roasted
          </Button>
        </div>
      </div>
    </div>
  );
}
