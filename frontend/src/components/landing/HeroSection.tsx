"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import heroBg from "@/assets/hero-bg.jpg";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={heroBg}
          alt="Romantic Background"
          fill
          className="object-cover"
          placeholder="blur"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-background/90" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </motion.div>
            <span className="font-body text-sm font-semibold text-primary-foreground tracking-wider uppercase">
              Valentine's Special 2026
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            >
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </motion.div>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-italianno text-primary-foreground leading-none mb-6">
            Turn Your Love Story Into{" "}
            <span className="block font-italianno text-6xl sm:text-7xl md:text-9xl mt-4">a Beautiful Digital Memory</span>
          </h1>

          <p className="text-2xl sm:text-3xl text-primary-foreground/90 font-italianno mb-10 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Create a personalized gallery of your most precious moments together. <br className="hidden md:block" />
            Share it with a unique link or QR code.
          </p>

          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="romantic-gradient text-primary-foreground px-8 py-4 rounded-full text-3xl font-italianno shadow-xl animate-pulse-glow inline-flex items-center gap-2"
            >
              Create Your Love Gallery <Heart className="w-5 h-5 fill-current" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
