"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw } from "lucide-react";

// NOTE: The following is a placeholder for the original Button component.
// In a real app, you would use your existing UI library.
const Button = ({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${className}`}
        {...props}
    >
        {children}
    </button>
);

// Seeded pseudo-random number generator
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }
}

export interface ImageData {
    src: string;
    alt: string;
    id: string;
}

interface ScatterPosition {
    x: number;
    y: number;
    rotation: number;
    scale: number;
}

interface ImageStackProps {
    images?: ImageData[];
    maxRotation?: number;
    scatterRadius?: number;
    seed?: number;
    className?: string;
    onReshuffle?: () => void;
}

export interface ImageStackRef {
    reshuffle: () => void;
}

// Framer Motion variants for container and cards
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0, // No initial pause, start staggering immediately
            staggerChildren: 1.5, // Reverted to the original 1.5-second stagger
        },
    },
};

const cardVariants = {
    hidden: (custom: { zIndex: number }) => ({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        zIndex: custom.zIndex,
    }),
    visible: (custom: {
        position: ScatterPosition;
        zIndex: number;
        springConfig: any;
    }) => ({
        x: custom.position.x,
        y: custom.position.y,
        rotate: custom.position.rotation,
        scale: custom.position.scale,
        zIndex: custom.zIndex,
        transition: custom.springConfig,
    }),
};

const ImageStack = React.forwardRef<ImageStackRef, ImageStackProps>(
    (
        {
            images = [],
            maxRotation = 15,
            scatterRadius = 40,
            seed = 12345,
            className = "",
            onReshuffle,
        },
        ref
    ) => {
        const [stack, setStack] = React.useState<ImageData[]>([]);
        const [isVisible, setIsVisible] = React.useState(false);
        const [imagesLoaded, setImagesLoaded] = React.useState(false);
        const [scatterPositions, setScatterPositions] = React.useState<ScatterPosition[]>([]);
        const [currentSeed, setCurrentSeed] = React.useState(seed);

        const containerRef = React.useRef<HTMLDivElement>(null);
        const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
        const prefersReducedMotion = useReducedMotion();

        // Initialize stack
        React.useEffect(() => {
            if (images.length > 0) {
                setStack(images);
            }
        }, [images]);

        // Generate scatter positions - stable based on index
        const generateScatterPositions = React.useCallback(
            (seedValue: number, count: number) => {
                const rng = new SeededRandom(seedValue);
                return Array.from({ length: count }).map(() => ({
                    x: rng.range(-280, -240),
                    y: rng.range(-scatterRadius, scatterRadius),
                    rotation: rng.range(-maxRotation, maxRotation),
                    scale: rng.range(0.95, 1.05),
                }));
            },
            [scatterRadius, maxRotation]
        );

        // Preload images
        React.useEffect(() => {
            const preloadImages = async () => {
                const loadPromises = images.map((image) => {
                    return new Promise<string>((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(image.id);
                        img.onerror = () => resolve(image.id); // Resolve anyway
                        img.src = image.src;
                    });
                });

                try {
                    await Promise.all(loadPromises);
                    setImagesLoaded(true);
                } catch (error) {
                    setImagesLoaded(true);
                }
            };

            if (images.length > 0) {
                preloadImages();
            } else {
                setImagesLoaded(true);
            }
        }, [images]);

        // Generate initial positions
        React.useEffect(() => {
            setScatterPositions(generateScatterPositions(currentSeed, images.length));
        }, [currentSeed, images.length, generateScatterPositions]);

        // Intersection observer
        React.useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && imagesLoaded) {
                        setIsVisible(true);
                    }
                },
                { threshold: 0.1 }
            );

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => observer.disconnect();
        }, [imagesLoaded]);

        // Looping logic
        const moveTopToBottom = React.useCallback(() => {
            setStack((prev) => {
                if (prev.length < 2) return prev;
                const [top, ...rest] = prev;
                return [...rest, top];
            });
        }, []);

        const startLoop = React.useCallback(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(moveTopToBottom, 4000); // 4 seconds per slide
        }, [moveTopToBottom]);

        const stopLoop = React.useCallback(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }, []);

        React.useEffect(() => {
            if (isVisible) {
                startLoop();
            }
            return stopLoop;
        }, [isVisible, startLoop, stopLoop]);

        const handleManualFlick = () => {
            stopLoop();
            moveTopToBottom();
            // Restart loop after a short delay
            setTimeout(startLoop, 1000);
        };

        const springConfig = prefersReducedMotion
            ? { type: "tween", duration: 0.3 }
            : { type: "spring", stiffness: 100, damping: 20 };

        return (
            <div
                className={`relative w-full h-[600px] flex items-center justify-center overflow-hidden ${className}`}
                onMouseEnter={stopLoop}
                onMouseLeave={startLoop}
            >
                <div
                    ref={containerRef}
                    className="relative w-full h-full min-w-[800px] flex items-center justify-center"
                    style={{ perspective: "1000px" }}
                >
                    {!imagesLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">Loading love memories...</div>
                        </div>
                    )}

                    {stack.map((image, index) => {
                        // Use original index for scatter position stability if possible,
                        // but since stack changes order, we map index 0 to scatterPositions[0].
                        // This means the "top" card always takes the "top" position style.
                        // When stack rotates, the new top card moves to the top position.

                        // We want the last item in stack (index = lengths-1) to be at the TOP visually?
                        // No, usually index 0 is first in DOM, so it's behind.
                        // Wait, absolute positioning: last in DOM is on top.
                        // Logic:
                        // We render stack[0] ... stack[N].
                        // stack[N] is LAST rendered -> ON TOP.
                        // So `moveTopToBottom` should actually take LAST and move to FIRST?
                        // Or if we render such that stack[0] is TOP (highest z-index).

                        // Let's force z-index.
                        // index 0: z-index: length (TOP)
                        // index 1: z-index: length - 1

                        const reverseIndex = stack.length - 1 - index; // 0 for last item, length-1 for first item

                        // If we want index 0 to be TOP.
                        const zIndex = stack.length - index;

                        // Use the scatter position corresponding to this visual slot
                        const position = scatterPositions[index];

                        if (!position) return null;

                        return (
                            <motion.div
                                key={image.id}
                                layoutId={image.id}
                                className="absolute cursor-pointer"
                                initial={false}
                                animate={{
                                    x: position.x,
                                    y: position.y,
                                    rotate: position.rotation,
                                    scale: position.scale,
                                    zIndex: zIndex
                                }}
                                transition={springConfig as any}
                                style={{
                                    left: "50%",
                                    top: "50%",
                                    marginLeft: "-160px",
                                    marginTop: "-225px",
                                }}
                                onClick={() => {
                                    // Only allow clicking the top one to flick it
                                    if (index === 0) handleManualFlick();
                                }}
                            >
                                <div className="bg-white p-4 shadow-xl border rounded-sm transform transition-transform hover:scale-105 duration-300">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-[280px] h-[350px] object-cover rounded-sm pointer-events-none"
                                    />
                                    {image.alt && (
                                        <div className="mt-3 text-lg font-handwriting text-gray-800 text-center min-h-[1.75rem]">
                                            {image.alt}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Helper text */}
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <p className="text-white/70 text-sm font-body animate-pulse">
                        Tap the top photo to flick • Auto-playing
                    </p>
                </div>
            </div>
        );
    }
);
ImageStack.displayName = "ImageStack";

export default ImageStack;
