import React from 'react';
import { motion } from 'framer-motion';

export function TrustStrip() {
  const stats = [
    { label: "Average Time Saved", value: "3.5 hours", subtext: "per application" },
    { label: "Response Rate", value: "45%", subtext: "2x industry average" },
    { label: "Active Users", value: "12,847+", subtext: "professionals" },
  ];

  const companies = [
    "Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Stripe", "Airbnb"
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-slate-500">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Candidates Landing Offers At
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-lg md:text-xl font-bold text-slate-700 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
