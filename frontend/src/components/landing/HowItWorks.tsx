"use client";

import { motion } from "framer-motion";
import { UserPlus, ImagePlus, Share2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Add Your Details",
    description: "Enter your names and a sweet love message for your partner.",
  },
  {
    icon: ImagePlus,
    title: "Upload Memories",
    description: "Add your favourite photos together — up to 20 beautiful moments.",
  },
  {
    icon: Share2,
    title: "Share Your Gallery",
    description: "Get a unique link and QR code to share your love story with the world.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-cream">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4"
        >
          How It Works
        </motion.h2>
        <p className="text-muted-foreground font-body mb-14 text-lg">Three simple steps to create magic</p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 rounded-full romantic-gradient flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="font-heading text-sm text-primary font-semibold mb-2">Step {i + 1}</div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground font-body">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
