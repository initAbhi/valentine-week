"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface ValentineData {
    partnerName: string;
    senderPhone: string;
}

export default function ValentinePage() {
    const params = useParams();
    // In id routing, we get the ID
    const id = params?.id as string;

    const [data, setData] = useState<ValentineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [yesPressed, setYesPressed] = useState(false);
    const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
    const [hoverCount, setHoverCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const fetchData = async () => {
            if (!id) return;
            try {
                // Try fetching from Supabase
                const { data: result, error } = await supabase
                    .from('valentines')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (result) {
                    setData({
                        partnerName: result.partnerName,
                        senderPhone: result.senderPhone
                    });
                } else {
                    // Fallback to legacy URL decoding if not found
                    const decodedName = decodeURIComponent(id);
                    const urlParams = new URLSearchParams(window.location.search);
                    const phone = urlParams.get("phone");
                    setData({
                        partnerName: decodedName,
                        senderPhone: phone || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // Fallback
                const decodedName = decodeURIComponent(id);
                const urlParams = new URLSearchParams(window.location.search);
                const phone = urlParams.get("phone");
                setData({
                    partnerName: decodedName,
                    senderPhone: phone || ""
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleYesClick = () => {
        setYesPressed(true);
        if (data?.senderPhone) {
            // Open WhatsApp with a message
            const message = `Yes! I will be your valentine! 💖`;
            const whatsappUrl = `https://wa.me/${data.senderPhone}?text=${encodeURIComponent(message)}`;
            setTimeout(() => {
                window.open(whatsappUrl, "_blank");
            }, 2000); // Wait for animation to play a bit
        }
    };

    const moveNoButton = () => {
        if (typeof window === 'undefined') return;

        const padding = 50;
        const maxX = window.innerWidth / 2 - padding;
        const maxY = window.innerHeight / 2 - padding;

        const x = (Math.random() * 2 - 1) * maxX;
        const y = (Math.random() * 2 - 1) * maxY;

        setNoBtnPosition({ x, y });
        setHoverCount(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Heart className="w-12 h-12 text-rose-400 animate-pulse fill-rose-400" />
            </div>
        );
    }

    if (yesPressed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-100 p-4 text-center overflow-hidden">
                {mounted && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative z-10"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Heart className="w-24 h-24 md:w-32 md:h-32 text-rose-500 fill-rose-500 mx-auto mb-6 md:mb-8" />
                        </motion.div>
                        <h1 className="text-3xl md:text-6xl font-heading font-bold text-rose-600 mb-4 px-4">
                            Yay! I knew it! 💖
                        </h1>
                        <p className="text-lg md:text-xl text-rose-400 font-body px-4">
                            Best Valentine Ever, {data?.partnerName || "love"}!
                        </p>
                    </motion.div>
                )}

                {mounted && [...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            scale: 0
                        }}
                        animate={{
                            x: (Math.random() - 0.5) * window.innerWidth,
                            y: (Math.random() - 0.5) * window.innerHeight,
                            opacity: 0,
                            scale: Math.random() * 2
                        }}
                        transition={{
                            duration: 2,
                            ease: "easeOut",
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2
                        }}
                        style={{
                            left: "50%",
                            top: "50%"
                        }}
                    >
                        <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-200 p-4 overflow-hidden relative">
            {mounted && [...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-pink-300 pointer-events-none"
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: 0.5
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                >
                    <Heart className="w-8 h-8 fill-current" />
                </motion.div>
            ))}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-white relative z-10"
            >
                <div className="mb-6 relative">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        <div className="w-32 h-32 bg-rose-100 rounded-full mx-auto flex items-center justify-center mb-2 text-6xl">
                            🐹
                        </div>
                    </motion.div>
                    <Heart className="w-8 h-8 text-rose-400 fill-rose-400 absolute top-0 right-1/4 animate-bounce" />
                    <Heart className="w-6 h-6 text-rose-300 fill-rose-300 absolute bottom-0 left-1/4 animate-pulse" />
                </div>

                <h1 className="text-2xl md:text-4xl font-heading font-bold text-rose-900 mb-6 md:mb-8 leading-tight px-2">
                    {data?.partnerName}, will you be my valentine?
                </h1>

                <div className="flex flex-col gap-4 items-center justify-center min-h-[120px] relative">
                    <button
                        onClick={handleYesClick}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 md:px-12 rounded-full text-lg md:text-xl shadow-lg transform transition hover:scale-105 active:scale-95 z-20 w-auto min-w-[120px]"
                    >
                        Yes
                    </button>

                    <div className="relative w-full h-14">
                        <motion.button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            animate={{ x: noBtnPosition.x, y: noBtnPosition.y }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 md:px-12 rounded-full text-lg md:text-xl shadow-inner absolute left-1/2 transform -translate-x-1/2 min-w-[120px]"
                            style={{
                                position: hoverCount > 0 ? 'fixed' : 'absolute',
                                left: hoverCount > 0 ? '50%' : '50%',
                                top: hoverCount > 0 ? '50%' : 'auto',
                            }}
                        >
                            {hoverCount === 0 ? "No" : "No"}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
