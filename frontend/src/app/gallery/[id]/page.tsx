"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GalleryData } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import CountdownTimer from "@/components/CountdownTimer";
import ThemeEffect, { videoThemes } from "@/components/ThemeEffect";
import { ImageSwiper } from "@/components/ui/image-swiper";

const themeStyles: Record<string, string> = {
    "rose-red": "from-rose to-rose-dark",
    "soft-pink": "from-blush to-rose-light",
    "candle-light": "from-candle to-gold",
    "midnight-passion": "from-slate-900 via-rose-950 to-black",
    "ocean-romance": "from-cyan-900 via-blue-900 to-indigo-950",
    "golden-sunset": "from-orange-500 via-red-500 to-pink-600",
    "enchanted-forest": "from-green-900 via-emerald-900 to-teal-950",
    "lavender-dream": "from-indigo-300 via-purple-300 to-pink-300",
    "lavender-mist": "from-indigo-300 via-purple-300 to-pink-300",
    "velvet-night": "from-violet-950 via-fuchsia-950 to-black",
    "classic-love": "from-gray-100 via-gray-200 to-gray-300",
    "cherry-blossom": "from-pink-200 via-rose-200 to-red-100",
    "starry-sky": "from-slate-900 via-indigo-950 to-slate-900",
    "autumn-warmth": "from-orange-700 via-amber-700 to-yellow-800",
    "mystic-aura": "from-teal-900 via-purple-900 to-indigo-900",
    "pure-elegance": "from-neutral-100 via-stone-100 to-zinc-100",
};

const GalleryView = () => {
    const params = useParams();
    const id = params?.id as string;
    const [gallery, setGallery] = useState<GalleryData | null>(null);
    const [copied, setCopied] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('galleries')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error("Error fetching gallery:", error);
                    return;
                }

                if (data) {
                    // Start of backward compatibility or data normalization if needed
                    // For now assuming data matches GalleryData interface or is compatible
                    setGallery(data as unknown as GalleryData);
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
        };
        fetchGallery();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => setShowIntro(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out our love gallery! 💕 ${shareUrl}`)}`, "_blank");
    };

    if (!gallery) {
        return (
            <div className="min-h-screen flex items-center justify-center romantic-gradient-soft">
                <div className="text-center glass-card rounded-2xl p-10">
                    <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Gallery Not Found</h2>
                    <p className="text-muted-foreground font-body mb-6">This love story might have expired or doesn't exist yet.</p>
                    <Link href="/" className="romantic-gradient text-primary-foreground px-6 py-3 rounded-full font-body font-semibold inline-block">
                        Create Your Own ❤️
                    </Link>
                </div>
            </div>
        );
    }

    const gradient = themeStyles[gallery.theme] || themeStyles["rose-red"];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Gradient */}
            {!videoThemes.includes(gallery.theme) && (
                <div className={`fixed inset-0 z-0 bg-gradient-to-br ${gradient}`} />
            )}

            <ThemeEffect theme={gallery.theme} />

            {/* Background Music */}
            {gallery.music && (
                <audio autoPlay loop>
                    <source src={gallery.music} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}

            {/* Animated intro */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${gradient}`}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center text-primary-foreground"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Heart className="w-16 h-16 fill-current mx-auto mb-6" />
                            </motion.div>
                            <h1 className="font-heading text-4xl sm:text-6xl font-bold mb-4">
                                {gallery.yourName} & {gallery.partnerName}
                            </h1>
                            <p className="font-body text-lg opacity-90">A Love Story</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main gallery content */}
            <div className="min-h-screen relative z-10 w-full">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3.2 }}
                        className="text-center mb-12"
                    >
                        <Heart className="w-10 h-10 text-primary-foreground fill-current mx-auto mb-4" />
                        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground mb-2">
                            {gallery.yourName} & {gallery.partnerName}
                        </h1>
                        {gallery.specialDate && (
                            <p className="font-body text-primary-foreground/80">
                                Together since {new Date(gallery.specialDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        )}
                    </motion.div>

                    {/* Photo slideshow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.4 }}
                        className="mb-12 flex justify-center"
                    >
                        {gallery.photos.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <ImageSwiper
                                    images={gallery.photos.map(p => p.url).join(",")}
                                    cardWidth={380}
                                    cardHeight={500}
                                />
                                <p className="mt-6 text-primary-foreground/80 font-body text-sm animate-pulse">
                                    Swipe right or left to see more memories ✨
                                </p>
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/3] bg-primary-foreground/10 rounded-2xl flex items-center justify-center">
                                <p className="text-primary-foreground">No photos available</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Love message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3.8 }}
                        className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center mb-12"
                    >
                        <Heart className="w-8 h-8 text-primary-foreground fill-current mx-auto mb-4" />
                        <p className="font-heading text-xl sm:text-2xl text-primary-foreground italic leading-relaxed">
                            "{gallery.loveMessage}"
                        </p>
                        <p className="font-body text-primary-foreground/70 mt-4">
                            — {gallery.yourName}
                        </p>
                    </motion.div>

                    {/* Love timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4 }}
                        className="mb-12"
                    >
                        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-8">Our Love Story</h2>
                        <div className="space-y-6">
                            {[
                                ...gallery.stories.map(s => ({ title: s.title, icon: s.icon, text: s.content })),
                                { title: "Forever Together", icon: "💕", text: `${gallery.yourName} & ${gallery.partnerName} — now and always.` },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 flex items-start gap-4"
                                >
                                    <span className="text-3xl">{item.icon}</span>
                                    <div>
                                        <h3 className="font-heading text-lg font-bold text-primary-foreground">{item.title}</h3>
                                        <p className="font-body text-primary-foreground/80 text-sm mt-1">{item.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Countdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4.2 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-heading text-2xl font-bold text-primary-foreground mb-6">Valentine's Day Countdown</h2>
                        <CountdownTimer />
                    </motion.div>

                    {/* Share section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4.4 }}
                        className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center"
                    >
                        <Share2 className="w-8 h-8 text-primary-foreground mx-auto mb-4" />
                        <h2 className="font-heading text-2xl font-bold text-primary-foreground mb-6">Share Your Love Story</h2>

                        <div className="flex justify-center mb-6">
                            <div className="bg-primary-foreground rounded-xl p-3">
                                <QRCodeSVG value={shareUrl} size={140} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={copyLink}
                                className="px-6 py-3 rounded-full font-body font-semibold bg-primary-foreground text-primary flex items-center gap-2 justify-center hover:opacity-90 transition-opacity"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                            <button
                                onClick={shareWhatsApp}
                                className="px-6 py-3 rounded-full font-body font-semibold bg-[hsl(142,70%,45%)] text-primary-foreground flex items-center gap-2 justify-center hover:opacity-90 transition-opacity"
                            >
                                Share on WhatsApp
                            </button>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <div className="text-center py-10">
                        <p className="font-body text-primary-foreground/60 flex items-center justify-center gap-1 text-sm">
                            Made with <Heart className="w-3 h-3 fill-current" /> by <a href="https://www.web-matrix.in" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary-foreground transition-all">WebMatrix</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryView;
