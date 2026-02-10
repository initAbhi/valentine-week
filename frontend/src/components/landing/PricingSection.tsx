"use client";

import { motion } from "framer-motion";
import { Heart, Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "First Love",
    price: "₹149",
    originalPrice: "₹299",
    features: ["Up to 10 Photos", "1 Theme", "Unique Link", "QR Code"],
    popular: false,
  },
  {
    name: "Forever Love",
    price: "₹399",
    originalPrice: "₹999",
    features: ["Up to 20 Photos", "All Themes + Music", "Priority Support", "Download as Video", "Custom Domain"],
    popular: true,
  },
  {
    name: "True Love",
    price: "₹249",
    originalPrice: "₹499",
    features: ["Up to 15 Photos", "All Themes", "Background Music", "Unique Link + QR", "Love Timeline"],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-20 px-4 romantic-gradient-soft">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4"
        >
          Choose Your Package
        </motion.h2>
        <p className="text-muted-foreground font-body mb-14 text-lg">Every love story deserves to be celebrated</p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-2xl p-8 relative ${plan.popular
                ? "romantic-gradient text-primary-foreground shadow-2xl scale-105"
                : "glass-card text-foreground"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary-foreground text-xs font-bold px-4 py-1 rounded-full font-body">
                  MOST POPULAR
                </div>
              )}
              <Heart className={`w-8 h-8 mx-auto mb-4 ${plan.popular ? "fill-current" : "text-primary fill-primary"}`} />
              <h3 className="font-heading text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-4xl font-heading font-bold line-through text-muted-foreground/80">{plan.originalPrice}</span>
                <span className="text-4xl font-heading font-bold">{plan.price}</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-full font-body font-semibold transition-colors ${plan.popular
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : "romantic-gradient text-primary-foreground"
                    }`}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
