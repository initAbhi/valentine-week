"use client";

import { motion } from "framer-motion";
import CountdownTimer from "../CountdownTimer";

const CountdownSection = () => {
  return (
    <section className="py-20 px-4 bg-cream">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4"
        >
          Valentine's Day is Coming
        </motion.h2>
        <p className="text-muted-foreground font-body mb-10 text-lg">
          Don't miss the chance to surprise your special someone ❤️
        </p>
        <CountdownTimer />
      </div>
    </section>
  );
};

export default CountdownSection;
