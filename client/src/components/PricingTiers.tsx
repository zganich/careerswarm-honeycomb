import { motion } from "framer-motion";
import { Check, Zap, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";

/**
 * PricingTiers - Conversion-optimized pricing section
 * 
 * Features:
 * - Three tiers: Free (gateway), Pro (highlighted), Teams
 * - Pro tier emphasized as target conversion
 * - Money-back guarantee badge
 * - Annual discount (2 months free)
 * - Social proof: "Most candidates upgrade within 3 days"
 */

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  icon: React.ReactNode;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring the platform",
    icon: <Shield className="w-6 h-6" />,
    features: [
      "5 resume analyses per month",
      "Basic ATS scoring",
      "Master profile creation",
      "Standard templates",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious job seekers",
    icon: <Zap className="w-6 h-6" />,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited resume analyses",
      "Advanced ATS optimization",
      "Real-time job matching",
      "Premium templates",
      "Priority support",
      "Interview prep AI",
      "Cover letter generation",
      "LinkedIn profile optimization",
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Teams",
    price: "$99",
    period: "per month",
    description: "For recruiting teams and agencies",
    icon: <Users className="w-6 h-6" />,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Candidate pipeline management",
      "Team collaboration tools",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
  },
];

export function PricingTiers({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Choose Your Career Accelerator
          </h2>
          <p className="text-xl text-slate-600 mb-6">
            Join thousands of candidates landing their dream roles
          </p>

          {/* Annual Discount Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="text-sm font-semibold text-emerald-700">
              💰 Save 2 months with annual billing
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white border-2 rounded-2xl p-8 transition-all ${
                tier.highlighted
                  ? "border-orange-500 shadow-2xl shadow-orange-500/20 scale-105"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    {tier.badge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tier.highlighted ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                </div>
                <p className="text-sm text-slate-600">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">/{tier.period}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => onSelectPlan(tier.name.toLowerCase())}
                className={`w-full py-6 rounded-xl font-semibold mb-6 ${
                  tier.highlighted
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                }`}
              >
                {tier.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Most candidates upgrade within 3 days</span>{" "}
            after seeing their first optimized resume
          </p>
        </motion.div>

        {/* Money-Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex items-center justify-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto"
        >
          <Shield className="w-6 h-6 text-emerald-600" />
          <div className="text-left">
            <div className="font-semibold text-emerald-900">30-Day Money-Back Guarantee</div>
            <div className="text-sm text-emerald-700">Not satisfied? Get a full refund, no questions asked</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
