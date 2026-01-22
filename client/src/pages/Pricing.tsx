import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "5 achievements",
      "3 resumes per month",
      "Basic templates",
      "STAR methodology wizard",
      "Impact Meter scoring",
    ],
    cta: "Get Started",
    tier: "free" as const,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious job seekers",
    features: [
      "Unlimited achievements",
      "Unlimited resumes",
      "PDF export",
      "Email integration",
      "Browser extension",
      "AI suggestions",
      "Skills gap analysis",
      "Past job import",
      "Bulk achievement import",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    tier: "pro" as const,
    popular: true,
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const createCheckout = trpc.stripe.createCheckout.useMutation();

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({ tier: "pro" });
      
      if (result.url) {
        toast.success("Redirecting to checkout...");
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  const currentTier = user?.subscriptionTier || "free";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-xl">Careerswarm</span>
          </a>
          <nav className="flex items-center space-x-6">
            <a href="/" className="text-sm font-medium hover:underline">
              Home
            </a>
            <a href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="container py-16">
        <div className="mx-auto max-w-5xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your career goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "$0" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {tier.tier === "free" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = getLoginUrl();
                      } else {
                        window.location.href = "/dashboard";
                      }
                    }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : tier.cta}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleUpgrade}
                    disabled={currentTier === "pro"}
                  >
                    {currentTier === "pro"
                      ? "Current Plan"
                      : false
                      ? "Loading..."
                      : tier.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to Pro at any time. If you downgrade, you'll keep Pro features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards through Stripe, our secure payment processor.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Can I test Pro features before subscribing?
              </h3>
              <p className="text-muted-foreground">
                The Free plan gives you full access to our core features. Upgrade to Pro when you're ready for unlimited usage and advanced features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
