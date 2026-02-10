"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookGalleryProps {
    images: { url: string; title?: string }[];
}

export default function BookGallery({ images }: BookGalleryProps) {
    const [currentPage, setCurrentPage] = useState(0);

    // Total pages (images). We'll treat each image as a full page.
    // Visuals: Book is open.
    // Right side shows images[currentPage].
    // Left side shows images[currentPage - 1].
    // But for a true "flip" effect, we need a "flipping" page.

    // Simplified logic:
    // We have a stack of pages.
    // Pages i > currentPage are on the right (stacked).
    // Pages i < currentPage are on the left (stacked).
    // The page at currentPage is "active" or just flipped.

    // Let's use a robust CSS 3D approach.
    // Each "Sheet" has a Front (Image N) and Back (Image N+1).
    // This reduces the number of sheets by half.
    // If we have 10 images, we have 5 sheets.
    // Sheet 0: Front=Img0, Back=Img1
    // Sheet 1: Front=Img2, Back=Img3

    const totalSheets = Math.ceil(images.length / 2);

    const turnPage = (direction: "next" | "prev") => {
        if (direction === "next" && currentPage < totalSheets) {
            setCurrentPage((p) => p + 1);
        } else if (direction === "prev" && currentPage > 0) {
            setCurrentPage((p) => p - 1);
        }
    };

    if (images.length === 0) return null;

    return (
        <div className="flex flex-col items-center justify-center py-10 perspective-[1500px]">
            <div className="relative w-[300px] h-[400px] sm:w-[350px] sm:h-[480px] md:w-[450px] md:h-[600px] preserve-3d transition-transform duration-1000">
                {/* Render Sheets in reverse order so lower sheets are behind */}
                {Array.from({ length: totalSheets }).map((_, i) => {
                    const index = i;
                    const frontImg = images[index * 2];
                    const backImg = images[index * 2 + 1];
                    const isFlipped = index < currentPage;

                    // Z-index calculation to ensure correct stacking
                    // When not flipped (right side): higher index = lower z-index
                    // When flipped (left side): higher index = higher z-index (on top of stack)
                    // Actually:
                    // Right stack: 0 is top, 1 is under...
                    // Left stack: 0 is bottom, 1 is top...

                    let zIndex = 0;
                    if (isFlipped) {
                        zIndex = index; // 0, 1(top), 2(topmost if turned)
                    } else {
                        zIndex = totalSheets - index; // 0(top), 1...
                    }

                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform-style-3d origin-left",
                                isFlipped ? "rotate-y-[-180deg]" : "rotate-y-0"
                            )}
                            style={{ zIndex }}
                            onClick={() => {
                                if (isFlipped) {
                                    // Clicked left side (back of sheet), go back
                                    if (currentPage === index + 1) turnPage("prev");
                                } else {
                                    // Clicked right side (front of sheet), go forward
                                    if (currentPage === index) turnPage("next");
                                }
                            }}
                        >
                            {/* Front of the sheet (Right Page) */}
                            <div
                                className="absolute inset-0 w-full h-full backface-hidden bg-white border-l border-gray-200 shadow-md rounded-r-md overflow-hidden"
                                style={{
                                    backgroundImage: `url(${frontImg?.url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {/* Paper texture overlay */}
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5 pointer-events-none" />

                                {/* Cover Title */}
                                {index === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center transform transition-transform hover:scale-105 duration-500">
                                            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                                My Love Gallery
                                            </h1>
                                            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Back of the sheet (Left Page) */}
                            <div
                                className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border-r border-gray-200 shadow-md rounded-l-md overflow-hidden"
                                style={{
                                    backgroundImage: `url(${backImg?.url || ''})`, // Handle odd number of images
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: backImg ? 'white' : '#f0f0f0' // Fallback for empty back
                                }}
                            >
                                {/* Paper texture overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className='flex gap-8 mt-8'>
                <button
                    type='button'
                    onClick={() => turnPage("prev")}
                    disabled={currentPage === 0}
                    className='p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all active:scale-95 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed'
                >
                    <ChevronLeft size={24} />
                </button>
                <p className="text-white font-body py-2">
                    {currentPage} / {totalSheets}
                </p>
                <button
                    type='button'
                    onClick={() => turnPage("next")}
                    disabled={currentPage === totalSheets}
                    className='p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all active:scale-95 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed'
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <p className="text-white/60 text-sm mt-2 font-body">
                Tap on pages to flip
            </p>

            <style jsx global>{`
            .perspective-1500 {
                perspective: 1500px;
            }
            .preserve-3d {
                transform-style: preserve-3d;
            }
            .backface-hidden {
                backface-visibility: hidden;
            }
            .rotate-y-180 {
                transform: rotateY(180deg);
            }
            .rotate-y-\[-180deg\] {
                transform: rotateY(-180deg);
            }
            .rotate-y-0 {
                transform: rotateY(0deg);
            }
            .transform-style-3d {
                transform-style: preserve-3d;
            }
            .origin-left {
                transform-origin: left center;
            }
        `}</style>
        </div>
    );
}
