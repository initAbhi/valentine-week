"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Copy, Check, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import ThemeEffect from "@/components/ThemeEffect";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";

type Plan = 'free' | 'premium' | 'ultimate';

export default function CreateValentine() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<'form' | 'result'>('form');
    // Defaulting to free or a standard plan since selection is removed
    const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [partnerPhone, setPartnerPhone] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<{ senderName: string; partnerName: string; senderPhone: string; partnerPhone: string }>();

    useEffect(() => {
        setMounted(true);
    }, []);

    const onSubmit = async (data: { senderName: string; partnerName: string; senderPhone: string; partnerPhone: string }) => {
        setIsLoading(true);

        try {
            const { data: result, error } = await supabase
                .from('valentines')
                .insert([
                    {
                        senderName: data.senderName,
                        partnerName: data.partnerName,
                        senderPhone: `+91${data.senderPhone}`,
                        partnerPhone: `+91${data.partnerPhone}`,
                        plan: selectedPlan
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (result) {
                const id = result.id;
                const url = `${window.location.origin}/valentine/${id}`;

                setGeneratedLink(url);
                setPartnerPhone(data.partnerPhone.trim());
                setPartnerName(data.partnerName.trim());
                setStep('result');
            }
        } catch (error) {
            console.error("Error creating valentine:", error);
            alert("Failed to create request. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendToPartner = () => {
        if (!partnerPhone || !generatedLink) return;

        const message = `I have a special surprise for you! 💖\n\nOpen this link: ${generatedLink}`;
        const whatsappUrl = `https://wa.me/${partnerPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-pink-50 flex items-center justify-center p-4">
            <ThemeEffect theme="soft-pink" />

            {/* Background elements */}
            {mounted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-pink-200/50"
                            initial={{
                                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                                scale: Math.random() * 2 + 1,
                                opacity: 0
                            }}
                            animate={{
                                y: [null, Math.random() * -100],
                                rotate: Math.random() * 360,
                                opacity: [0, 0.8, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <Heart className="fill-current" />
                        </motion.div>
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl w-full relative z-10 border border-pink-100"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-gradient-to-tr from-rose-400 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg"
                    >
                        <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
                    </motion.div>
                    <h1 className="font-heading text-3xl font-bold text-gray-800 mb-2">Create a Request</h1>
                    <p className="text-gray-600 font-body">Make a special page to ask that special someone.</p>
                </div>

                {step === 'form' && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                                    Your Name
                                </label>
                                <input
                                    {...register("senderName", { required: "Your name is required" })}
                                    type="text"
                                    placeholder="e.g. John"
                                    className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-body text-gray-800 bg-white/50 placeholder:text-gray-400"
                                />
                                {errors.senderName && (
                                    <p className="text-rose-500 text-sm mt-1">{errors.senderName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                                    Partner's Name
                                </label>
                                <input
                                    {...register("partnerName", { required: "Partner's name is required" })}
                                    type="text"
                                    placeholder="e.g. Sarah"
                                    className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-body text-gray-800 bg-white/50 placeholder:text-gray-400"
                                />
                                {errors.partnerName && (
                                    <p className="text-rose-500 text-sm mt-1">{errors.partnerName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                                    Your WhatsApp Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input
                                        {...register("senderPhone", {
                                            required: "Your phone number is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number" },
                                            onChange: (e) => {
                                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            }
                                        })}
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-pink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-body text-gray-800 bg-white/50 placeholder:text-gray-400"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Receive a WhatsApp message when they say Yes! 💖</p>
                                {errors.senderPhone && (
                                    <p className="text-rose-500 text-sm mt-1">{errors.senderPhone.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="partnerPhone" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                                    Partner's WhatsApp Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input
                                        {...register("partnerPhone", {
                                            required: "Partner's phone number is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number" },
                                            onChange: (e) => {
                                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            }
                                        })}
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-pink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-body text-gray-800 bg-white/50 placeholder:text-gray-400"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">We'll help you send the link to this number.</p>
                                {errors.partnerPhone && (
                                    <p className="text-rose-500 text-sm mt-1">{errors.partnerPhone.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'result' && (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300 max-w-md mx-auto">
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                            Page Created Successfully! 🎉
                        </div>

                        <div className="flex justify-center my-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <QRCodeSVG value={generatedLink || ''} size={150} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={sendToPartner}
                                className="w-full py-3 rounded-xl bg-[hsl(142,70%,45%)] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Send to {partnerName} on WhatsApp
                            </button>

                            <button
                                onClick={copyLink}
                                className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                {copied ? "Link Copied!" : "Copy Link"}
                            </button>

                            <a
                                href={generatedLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl border-2 border-rose-500 text-rose-600 font-bold hover:bg-rose-50 transition-all block"
                            >
                                Open Page
                            </a>
                        </div>

                        <button
                            onClick={() => {
                                setGeneratedLink(null);
                                setPartnerPhone(null);
                                setPartnerName(null);
                                setStep('form');
                            }}
                            className="text-sm text-gray-500 hover:text-rose-500 mt-4 underline"
                        >
                            Create Another
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-rose-500 transition-colors font-body">
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
