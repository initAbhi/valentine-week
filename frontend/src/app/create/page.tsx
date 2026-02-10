"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Copy, Check, Upload, X, ChevronRight, Music, Palette, BookOpen, Crown, Zap, Play, Pause, ArrowLeft, ArrowRight, Star, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GalleryData, generateSlug } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import ThemeEffect from "@/components/ThemeEffect";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Plan = 'free' | 'true-love' | 'forever-love';

interface Photo {
    id: string;
    url: string;
    file: File;
    caption?: string;
}

const themes = [
    // First Love Package (Free)
    { id: "classic-love" as const, name: "Classic Love", colors: "from-gray-100 via-gray-200 to-gray-300", package: "first-love" },
    { id: "pure-elegance" as const, name: "Pure Elegance", colors: "from-neutral-100 via-stone-100 to-zinc-100", package: "first-love" },

    // True Love Package (₹249)
    { id: "rose-red" as const, name: "Rose Red", colors: "from-rose to-rose-dark", package: "true-love" },
    { id: "soft-pink" as const, name: "Soft Pink", colors: "from-blush to-rose-light", package: "true-love" },
    { id: "candle-light" as const, name: "Candle Light", colors: "from-candle to-gold", package: "true-love" },
    { id: "lavender-mist" as const, name: "Lavender Mist", colors: "from-indigo-300 via-purple-300 to-pink-300", package: "true-love" },

    // Forever Love Package (₹499)
    { id: "midnight-passion" as const, name: "Midnight Passion", colors: "from-slate-900 via-rose-950 to-black", package: "forever-love" },
    { id: "ocean-romance" as const, name: "Ocean Romance", colors: "from-cyan-900 via-blue-900 to-indigo-950", package: "forever-love" },
    { id: "golden-sunset" as const, name: "Golden Sunset", colors: "from-orange-500 via-red-500 to-pink-600", package: "forever-love" },
    { id: "enchanted-forest" as const, name: "Enchanted Forest", colors: "from-green-900 via-emerald-900 to-teal-950", package: "forever-love" },
    { id: "lavender-dream" as const, name: "Lavender Dream", colors: "from-indigo-300 via-purple-300 to-pink-300", package: "forever-love" },
    { id: "velvet-night" as const, name: "Velvet Night", colors: "from-violet-950 via-fuchsia-950 to-black", package: "forever-love" },
    { id: "cherry-blossom" as const, name: "Cherry Blossom", colors: "from-pink-200 via-rose-200 to-red-100", package: "forever-love" },
    { id: "starry-sky" as const, name: "Starry Sky", colors: "from-slate-900 via-indigo-950 to-slate-900", package: "forever-love" },
    { id: "autumn-warmth" as const, name: "Autumn Warmth", colors: "from-orange-700 via-amber-700 to-yellow-800", package: "forever-love" },
    { id: "mystic-aura" as const, name: "Mystic Aura", colors: "from-teal-900 via-purple-900 to-indigo-900", package: "forever-love" },
];

const musicOptions = [
    { id: "romantic" as const, name: "Romantic Instrumental", emoji: "🎻", url: "/music/romantic_instrumental.mpeg" },
    { id: "piano" as const, name: "Soft Piano", emoji: "🎹", url: "/music/soft_piano.mpeg" },
    { id: "love-song" as const, name: "Love Song", emoji: "🎵", url: "/music/love_song.mpeg" },
];

const CreateGallery = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
    const [formData, setFormData] = useState({
        yourName: "",
        partnerName: "",
        loveMessage: "",
        specialDate: "",
        stories: [
            { title: "First Meeting", content: "", icon: "✨" },
            { title: "First Date", content: "", icon: "🌹" },
            { title: "Memorable Moment", content: "", icon: "💑" },
        ]
    });
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [theme, setTheme] = useState<GalleryData["theme"]>("classic-love");
    const [music, setMusic] = useState<GalleryData["music"]>(musicOptions[0].url);
    const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);
    const [isCustomMusic, setIsCustomMusic] = useState(false);
    const [previewMusic, setPreviewMusic] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Plan limits
    const maxPhotos = selectedPlan === 'free' ? 10 : selectedPlan === 'true-love' ? 15 : 20;

    const handlePhotoDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files));
    }, [photos.length, maxPhotos]);

    const addFiles = (files: File[]) => {
        const remainingSlots = maxPhotos - photos.length;
        if (remainingSlots <= 0) return;

        const imageFiles = files.filter((f) => f.type.startsWith("image/")).slice(0, remainingSlots);
        const newPhotos = imageFiles.map((file) => ({
            id: Math.random().toString(36).substring(2),
            url: URL.createObjectURL(file),
            file,
        }));
        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (id: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan);
        // Reset photos if downgrading?
        // Let's just keep them but the limit will enforce on next add. 
        // Or we could slice them:
        // if (plan === 'free' && photos.length > 10) setPhotos(photos.slice(0, 10));
        setStep(2);
    };

    const canProceed = () => {
        if (step === 2) return formData.yourName.trim() && formData.partnerName.trim() && formData.loveMessage.trim();
        if (step === 4) return photos.length > 0;
        return true;
    };

    const [isGenerating, setIsGenerating] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [requiredPlan, setRequiredPlan] = useState<Plan | null>(null);

    // Helper to get the package tier for a theme
    const getThemePackage = (themeId: GalleryData["theme"]) => {
        const themeObj = themes.find(t => t.id === themeId);
        return themeObj?.package || 'first-love';
    };

    // Helper to check if theme requires upgrade
    const themeRequiresUpgrade = (themeId: GalleryData["theme"]) => {
        const themePackage = getThemePackage(themeId);
        if (selectedPlan === 'forever-love') return false;
        if (selectedPlan === 'true-love') return themePackage === 'forever-love';
        // Free plan (first-love)
        return themePackage !== 'first-love';
    };

    // Helper to get required plan for a theme
    const getRequiredPlan = (themeId: GalleryData["theme"]): Plan => {
        const themePackage = getThemePackage(themeId);
        if (themePackage === 'forever-love') return 'forever-love';
        if (themePackage === 'true-love') return 'true-love';
        return 'free';
    };

    const handleGenerate = async () => {
        // Check if theme requires upgrade
        if (themeRequiresUpgrade(theme)) {
            setRequiredPlan(getRequiredPlan(theme));
            setShowUpgradeModal(true);
            return;
        }

        setIsGenerating(true);

        try {
            let finalMusicUrl = music;

            // 0. Upload Custom Music if selected
            if (isCustomMusic && customMusicFile) {
                const musicFileName = `music-${Date.now()}-${customMusicFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                try {
                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(musicFileName, customMusicFile);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(musicFileName);

                    finalMusicUrl = publicUrlData.publicUrl;
                } catch (error) {
                    console.error("Error uploading music:", error);
                    alert("Failed to upload custom music. Using default music instead.");
                    finalMusicUrl = musicOptions[0].url;
                }
            }

            // 1. Upload photos to Supabase Storage
            const uploadedPhotos = await Promise.all(photos.map(async (p) => {
                if (p.file) {
                    const fileName = `${Date.now()}-${p.id}-${p.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

                    try {
                        const { data, error } = await supabase.storage
                            .from('uploads')
                            .upload(fileName, p.file);

                        if (error) {
                            console.error("Error uploading image:", error);
                            return { id: p.id, url: p.url, caption: p.caption };
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from('uploads')
                            .getPublicUrl(fileName);

                        return { id: p.id, url: publicUrlData.publicUrl, caption: p.caption };
                    } catch (err) {
                        console.error("Exception uploading image:", err);
                        return { id: p.id, url: p.url, caption: p.caption };
                    }
                }
                return { id: p.id, url: p.url, caption: p.caption };
            }));

            // 2. Generate slug
            const slug = generateSlug(formData.yourName, formData.partnerName);

            // 3. Insert into Supabase
            const { data, error } = await supabase
                .from('galleries')
                .insert([
                    {
                        yourName: formData.yourName,
                        partnerName: formData.partnerName,
                        loveMessage: formData.loveMessage,
                        specialDate: formData.specialDate,
                        theme,
                        music: finalMusicUrl,
                        stories: formData.stories,
                        photos: uploadedPhotos,
                        slug
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                router.push(`/gallery/${data.id}`);
            }
        } catch (error) {
            console.error("Error generating gallery:", error);
            alert("Something went wrong. Please try again.");
            setIsGenerating(false);
        }
    };

    const selectedThemeObj = themes.find(t => t.id === theme) || themes[0];
    const totalSteps = 5;

    return (
        <div className={`min-h-screen relative transition-colors duration-700 bg-gradient-to-br ${selectedThemeObj.colors}`}>
            <ThemeEffect theme={theme} />

            {/* Header */}
            <div className="relative z-10 px-4 py-6 flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/" className="flex items-center gap-2 text-foreground font-body hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </Link>
                <div className="flex items-center gap-2 text-primary">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-heading font-bold">LoveGallery</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 mb-10">
                <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold text-sm transition-colors ${s <= step ? "romantic-gradient text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {s < step ? <Check className="w-5 h-5" /> : s}
                        </div>
                    ))}
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full romantic-gradient"
                        animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="text-center mt-2 text-sm text-muted-foreground font-body">
                    {step === 1 && "Start Your Journey"}
                    {step === 2 && "Couple Details"}
                    {step === 3 && "Your Love Story"}
                    {step === 4 && "Upload Memories"}
                    {step === 5 && "Theme & Music"}
                </div>
            </div>

            {/* Steps */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
                <AnimatePresence mode="wait">
                    {/* STEP 1: PLAN SELECTION */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-8">Choose Your Package</h2>

                            <div className="grid md:grid-cols-1 gap-4">
                                {/* First Love Plan */}
                                <div
                                    onClick={() => handlePlanSelect('free')}
                                    className="group cursor-pointer bg-white/90 backdrop-blur-md p-6 rounded-2xl border-2 border-gray-100 hover:border-pink-300 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                            <Star className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">First Love <span className="text-sm font-normal text-gray-500 ml-1">₹149</span></h3>
                                            <p className="text-gray-500 text-sm">Classic themes, 10 photos max</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-pink-500 transition-colors" />
                                </div>

                                {/* True Love Plan */}
                                <div
                                    onClick={() => handlePlanSelect('true-love')}
                                    className="group cursor-pointer bg-white/90 backdrop-blur-md p-6 rounded-2xl border-2 border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">True Love <span className="text-sm font-normal text-gray-500 ml-1">₹249</span></h3>
                                            <p className="text-gray-500 text-sm">More themes, 15 photos max, Custom Music</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-pink-500 transition-colors" />
                                </div>

                                {/* Forever Love Plan */}
                                <div
                                    onClick={() => handlePlanSelect('forever-love')}
                                    className="group cursor-pointer bg-gradient-to-r from-purple-50 to-white/90 backdrop-blur-md p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-2xl transition-all relative overflow-hidden flex items-center justify-between"
                                >
                                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAR</div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Forever Love <span className="text-sm font-normal text-gray-500 ml-1">₹399</span></h3>
                                            <p className="text-gray-500 text-sm">All themes, 20 photos max, Custom Music</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-purple-500 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-2xl p-6 sm:p-8"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Heart className="w-6 h-6 text-primary fill-primary" />
                                <h2 className="font-heading text-2xl font-bold text-foreground">Couple Details</h2>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block font-body text-sm font-medium text-foreground mb-1.5">Your Name</label>
                                    <input
                                        type="text"
                                        value={formData.yourName}
                                        onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-body text-sm font-medium text-foreground mb-1.5">Partner's Name</label>
                                    <input
                                        type="text"
                                        value={formData.partnerName}
                                        onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your partner's name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-body text-sm font-medium text-foreground mb-1.5">Short Love Message</label>
                                    <textarea
                                        value={formData.loveMessage}
                                        onChange={(e) => setFormData({ ...formData, loveMessage: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        rows={3}
                                        placeholder="Write something from your heart..."
                                    />
                                </div>
                                <div>
                                    <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                                        Anniversary / Special Date <span className="text-muted-foreground">(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.specialDate}
                                        onChange={(e) => setFormData({ ...formData, specialDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: STORY */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-2xl p-6 sm:p-8"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="w-6 h-6 text-primary" />
                                <h2 className="font-heading text-2xl font-bold text-foreground">Your Love Story</h2>
                            </div>

                            <div className="space-y-5">
                                {formData.stories.map((story, index) => (
                                    <div key={index}>
                                        <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                                            {story.title} {story.icon}
                                        </label>
                                        <textarea
                                            value={story.content}
                                            onChange={(e) => {
                                                const newStories = [...formData.stories];
                                                newStories[index].content = e.target.value;
                                                setFormData({ ...formData, stories: newStories });
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            rows={3}
                                            placeholder={`Tell us about ${story.title.toLowerCase()}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: UPLOADS */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card rounded-2xl p-6 sm:p-8"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <ImagePlus className="w-6 h-6 text-primary" />
                                <h2 className="font-heading text-2xl font-bold text-foreground">Upload Memories</h2>
                            </div>
                            <p className="text-muted-foreground font-body mb-6 text-sm">
                                {photos.length}/{maxPhotos} photos added
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                                    {selectedPlan === 'free' ? 'First Love' : selectedPlan} plan
                                </span>
                            </p>

                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handlePhotoDrop}
                                onClick={() => photos.length < maxPhotos && document.getElementById("photo-input")?.click()}
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors mb-6 ${photos.length >= maxPhotos
                                    ? "border-muted-foreground/30 opacity-50 cursor-not-allowed"
                                    : "border-primary/30 cursor-pointer hover:border-primary/60 hover:bg-secondary/50"
                                    }`}
                            >
                                <Upload className="w-10 h-10 text-primary/50 mx-auto mb-3" />
                                <p className="font-body text-foreground font-medium">Drag & drop photos here</p>
                                <p className="font-body text-muted-foreground text-sm mt-1">or click to browse</p>
                                <input
                                    id="photo-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    disabled={photos.length >= maxPhotos}
                                    onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                                />
                            </div>

                            {/* Preview grid */}
                            {photos.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {photos.map((photo, index) => (
                                        <div key={photo.id} className="relative group flex flex-col gap-2">
                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removePhoto(photo.id)}
                                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Add a caption..."
                                                className="w-full px-2 py-1 text-sm rounded-md border bg-background/50 backdrop-blur-sm focus:bg-background transition-colors"
                                                onChange={(e) => {
                                                    const newPhotos = [...photos];
                                                    newPhotos[index] = { ...photo, caption: e.target.value };
                                                    setPhotos(newPhotos);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 5: THEME */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 sm:p-8 text-white"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Palette className="w-6 h-6 text-primary" />
                                <h2 className="font-heading text-2xl font-bold text-white">Theme & Music</h2>
                            </div>

                            {/* Theme selector */}
                            <h3 className="font-body font-semibold text-white mb-3">Choose a Theme</h3>

                            {/* All Themes Grouped but visually distinguished */}

                            {/* First Love Themes */}
                            <div className="mb-8">
                                <h4 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                                    First Love Themes
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {themes.filter(t => t.package === "first-love").map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`relative rounded-xl p-4 text-center border-2 transition-all backdrop-blur-sm bg-black/20 ${theme === t.id ? "border-primary shadow-lg" : "border-transparent hover:border-primary/30"}`}
                                        >
                                            <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${t.colors} mb-2 shadow-inner`} />
                                            <span className="font-body text-xs sm:text-sm text-white">{t.name}</span>
                                            {theme === t.id && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full romantic-gradient flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* True Love Themes */}
                            <div className="mb-8">
                                <h4 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                                    True Love Themes
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {themes.filter(t => t.package === "true-love").map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`relative rounded-xl p-4 text-center border-2 transition-all backdrop-blur-sm bg-black/20 ${theme === t.id
                                                ? "border-amber-500 shadow-xl shadow-amber-500/20"
                                                : "border-amber-200 hover:border-amber-400"}`}
                                        >
                                            <div className="absolute top-1 left-1 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">TRUE LOVE</div>
                                            <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${t.colors} mb-2 shadow-inner ring-1 ring-black/5`} />
                                            <span className="font-body text-xs sm:text-sm text-white font-medium">{t.name}</span>
                                            {theme === t.id && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Forever Love Themes */}
                            <div className="mb-8">
                                <h4 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Crown className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                    Forever Love Themes
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {themes.filter(t => t.package === "forever-love").map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`relative rounded-xl p-4 text-center border-2 transition-all group backdrop-blur-sm bg-black/20 ${theme === t.id
                                                ? "border-amber-500 shadow-xl shadow-amber-500/20"
                                                : "border-amber-200 hover:border-amber-400"}`}
                                        >
                                            <div className="absolute top-1 left-1 bg-purple-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">FOREVER</div>
                                            <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${t.colors} mb-2 shadow-inner ring-1 ring-black/5`} />
                                            <span className="font-body text-xs sm:text-sm text-white font-medium">{t.name}</span>
                                            {theme === t.id && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 flex items-center justify-center shadow-md">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                            {/* Premium sheen effect */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Music selector */}
                            <div className="flex items-center gap-2 mb-3">
                                <Music className="w-5 h-5 text-primary" />
                                <h3 className="font-body font-semibold text-white">Background Music</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Custom Music Upload Option - Only for True Love & Forever Love */}
                                {(selectedPlan === 'true-love' || selectedPlan === 'forever-love' || getThemePackage(theme) === 'true-love' || getThemePackage(theme) === 'forever-love') && (
                                    <div
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-sm ${isCustomMusic
                                            ? "border-rose-500 bg-rose-500/20"
                                            : "border-white/20 hover:border-white/40 bg-black/20"
                                            }`}
                                        onClick={() => document.getElementById('music-upload')?.click()}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCustomMusic ? "bg-rose-500 text-white" : "bg-white/10 text-white/70"
                                                }`}>
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1 text-white">Upload Custom Music</h3>
                                                <p className="text-sm text-white/70 mb-2">
                                                    {customMusicFile ? customMusicFile.name : "Select an MP3 or WAV file (Max 5MB)"}
                                                </p>
                                                {isCustomMusic && customMusicFile && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-200 bg-rose-500/30 px-2 py-0.5 rounded-full border border-rose-500/50">
                                                        <Check className="w-3 h-3" /> Selected
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="music-upload"
                                                accept=".mp3,audio/mpeg,.wav,audio/wav,.mpeg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert("File size must be less than 5MB");
                                                            return;
                                                        }
                                                        setCustomMusicFile(file);
                                                        setIsCustomMusic(true);
                                                        setMusic(""); // Clear preset music
                                                    }
                                                }}
                                            />
                                        </div>
                                        {/* Premium Badge */}
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> PREMIUM
                                        </div>
                                    </div>
                                )}

                                {/* Preset Music Options */}
                                {musicOptions.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all backdrop-blur-sm ${music === m.url && !isCustomMusic
                                            ? "border-rose-500 bg-rose-500/20"
                                            : "border-white/20 hover:border-white/40 bg-black/20"
                                            }`}
                                        onClick={() => {
                                            setMusic(m.url);
                                            setIsCustomMusic(false);
                                            setCustomMusicFile(null);
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${music === m.url && !isCustomMusic ? "bg-rose-500 text-white" : "bg-white/10 text-white/70"
                                                    }`}>
                                                    <span className="text-xl">{m.emoji}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{m.name}</h3>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (previewMusic === m.url) {
                                                        audioRef.current?.pause();
                                                        setPreviewMusic(null);
                                                    } else {
                                                        setPreviewMusic(m.url);
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                                            >
                                                {previewMusic === m.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Hidden Audio Player for Preview */}
                            <audio
                                ref={audioRef}
                                src={previewMusic || undefined}
                                onEnded={() => setPreviewMusic(null)}
                                autoPlay
                                className="hidden"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upgrade Modal */}
                <AnimatePresence>
                    {
                        showUpgradeModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Crown className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">
                                            Upgrade Required
                                        </h3>
                                        <p className="text-gray-600 font-body">
                                            This beautiful theme requires the{" "}
                                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                                                {requiredPlan === 'true-love' ? 'True Love' : 'Forever Love'}
                                            </span>{" "}
                                            package
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Current Plan:</span>
                                            <span className="font-semibold text-gray-800">
                                                {selectedPlan === 'free' ? 'First Love' : selectedPlan === 'true-love' ? 'True Love' : 'Forever Love'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Required Plan:</span>
                                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                                                {requiredPlan === 'true-love' ? 'True Love' : 'Forever Love'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                setShowUpgradeModal(false);
                                                setStep(1);
                                            }}
                                            className="w-full px-6 py-3 rounded-full font-body font-semibold romantic-gradient text-white hover:shadow-lg transition-all"
                                        >
                                            Change Plan
                                        </button>
                                        <button
                                            onClick={() => setShowUpgradeModal(false)}
                                            className="w-full px-6 py-3 rounded-full font-body font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Choose Different Theme
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Navigation buttons */}
                < div className="flex justify-between mt-8" >
                    {step > 1 ? (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 rounded-full font-body font-semibold border-2 border-primary text-primary hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </motion.button>
                    ) : (
                        <div />
                    )}

                    {
                        step < 5 ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => canProceed() && setStep(step + 1)}
                                disabled={!canProceed()}
                                className="px-6 py-3 rounded-full font-body font-semibold romantic-gradient text-primary-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="px-6 py-3 rounded-full font-body font-semibold romantic-gradient text-primary-foreground flex items-center gap-2 animate-pulse-glow disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isGenerating ? (
                                    <>Generating... <span className="animate-spin">⏳</span></>
                                ) : (
                                    <>Generate My Love Page <Heart className="w-4 h-4 fill-current" /></>
                                )}
                            </motion.button>
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default CreateGallery;
