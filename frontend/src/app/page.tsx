import Link from "next/link";
import { Gift } from "lucide-react";
import HeartParticles from "@/components/HeartParticles";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import CountdownSection from "@/components/landing/CountdownSection";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen">
            <HeartParticles />
            <HeroSection />
            <HowItWorks />
            <PricingSection />
            <CountdownSection />
            <Footer />

            {/* Sticky Surprise Button */}
            <Link
                href="/valentine"
                className="fixed bottom-6 right-6 z-50 animate-bounce"
            >
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-bold border-2 border-white/20">
                    <Gift className="w-5 h-5 animate-pulse" />
                    <span>Surprise Gift! 🎁</span>
                </div>
            </Link>
        </div>
    );
}
