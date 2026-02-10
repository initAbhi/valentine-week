"use client";

import { useEffect, useState } from "react";
import AnoAI from "@/components/ui/animated-shader-background";

interface Particle {
    id: number;
    left: number;
    top?: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    tx?: number; // transform x for some effects
}

type EffectType = "hearts" | "bubbles" | "stars" | "fireflies" | "leaves" | "glow";

const getEffectType = (theme: string): EffectType => {
    switch (theme) {
        case "ocean-romance":
            return "bubbles";
        case "midnight-passion":
        case "velvet-night":
        case "starry-sky":
            return "stars";
        case "enchanted-forest":
        case "mystic-aura":
            return "fireflies";
        case "autumn-warmth":
        case "cherry-blossom":
        case "lavender-dream":
        case "lavender-mist":
            return "leaves";
        case "candle-light":
        case "golden-sunset":
        case "pure-elegance":
            return "glow";
        default:
            return "hearts";
    }
};

export const videoThemes = [
    "autumn-warmth",
    "candle-light",
    "cherry-blossom",
    "enchanted-forest",
    "golden-sunset",

    "lavender-dream",
    "mystic-aura",
    "ocean-romance",
    "starry-sky",
];

const ThemeEffect = ({ theme }: { theme: string }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const effect = getEffectType(theme);

    useEffect(() => {
        const count = effect === "stars" || effect === "fireflies" ? 30 : 15;
        const generated: Particle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 16 + 8,
            duration: Math.random() * 8 + 6,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.5 + 0.2,
            tx: Math.random() * 100 - 50,
        }));
        setParticles(generated);
    }, [effect, theme]);

    const renderParticle = (p: Particle) => {
        switch (effect) {
            case "bubbles":
                return (
                    <div
                        key={p.id}
                        className="absolute rounded-full border border-white/30 bg-white/10 animate-float-bubbles"
                        style={{
                            left: `${p.left}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    />
                );
            case "stars":
                return (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-white animate-twinkle"
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: `${p.size / 4}px`,
                            height: `${p.size / 4}px`,
                            animationDuration: `${p.duration / 2}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    />
                );
            case "fireflies":
                return (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-yellow-400 shadow-[0_0_10px_2px_rgba(250,204,21,0.5)] animate-float-firefly"
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: `${p.size / 4}px`,
                            height: `${p.size / 4}px`,
                            animationDuration: `${p.duration * 1.5}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    />
                );
            case "leaves":
                return (
                    <div
                        key={p.id}
                        className="absolute animate-float-leaves text-white/40"
                        style={{
                            left: `${p.left}%`,
                            fontSize: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    >
                        {theme.includes("cherry") ? "🌸" : theme.includes("autumn") ? "🍂" : "🍃"}
                    </div>
                );
            case "glow":
                return (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-yellow-200/20 blur-xl animate-pulse-glow-heavy"
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: `${p.size * 10}px`,
                            height: `${p.size * 10}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity * 0.5,
                        }}
                    />
                );
            default: // hearts
                return (
                    <div
                        key={p.id}
                        className="absolute animate-float-heart"
                        style={{
                            left: `${p.left}%`,
                            fontSize: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    >
                        ❤️
                    </div>
                );
        }
    };

    if (videoThemes.includes(theme)) {
        return (
            <>
                <div className="fixed inset-0 z-0">
                    <video
                        key={theme}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={`/themes/${theme}.mp4`} type="video/mp4" />
                    </video>
                    {/* Add a slight overlay to ensure text readability if needed, or rely on the video's brightness */}
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {particles.map((p) => renderParticle(p))}
                </div>
            </>
        );
    }

    if (effect === "stars") {
        return (
            <div className="fixed inset-0 z-0">
                <AnoAI />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((p) => renderParticle(p))}
        </div>
    );
};

export default ThemeEffect;
