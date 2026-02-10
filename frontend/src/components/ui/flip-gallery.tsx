"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FLIP_SPEED = 750;
const flipTiming = { duration: FLIP_SPEED, iterations: 1 };

// flip down
const flipAnimationTop = [
    { transform: 'rotateX(0)' },
    { transform: 'rotateX(-90deg)' },
    { transform: 'rotateX(-90deg)' }
];
const flipAnimationBottom = [
    { transform: 'rotateX(90deg)' },
    { transform: 'rotateX(90deg)' },
    { transform: 'rotateX(0)' }
];

// flip up
const flipAnimationTopReverse = [
    { transform: 'rotateX(-90deg)' },
    { transform: 'rotateX(-90deg)' },
    { transform: 'rotateX(0)' }
];
const flipAnimationBottomReverse = [
    { transform: 'rotateX(0)' },
    { transform: 'rotateX(90deg)' },
    { transform: 'rotateX(90deg)' }
];

interface FlipGalleryProps {
    images: { url: string; title?: string }[];
}

export default function FlipGallery({ images }: FlipGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniteRef = useRef<NodeListOf<Element> | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // initialise first image once
    useEffect(() => {
        if (!containerRef.current || images.length === 0) return;
        uniteRef.current = containerRef.current.querySelectorAll('.unite');
        defineFirstImg();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images]); // Re-run if images change

    // Auto-play loop
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            updateIndex(1);
        }, 4000);
        return () => clearInterval(interval);
    }, [currentIndex, images.length]); // Re-run when index changes to keep closure fresh, or use functonal update

    const defineFirstImg = () => {
        if (!uniteRef.current) return;
        uniteRef.current.forEach((el) => setActiveImage(el as HTMLElement));
        setImageTitle();
    };

    const setActiveImage = (el: HTMLElement) => {
        if (images[currentIndex]) {
            el.style.backgroundImage = `url('${images[currentIndex].url}')`;
        }
    };

    const setImageTitle = () => {
        const gallery = containerRef.current;
        if (!gallery || !images[currentIndex]) return;
        gallery.setAttribute('data-title', images[currentIndex].title || '');
        gallery.style.setProperty('--title-y', '0');
        gallery.style.setProperty('--title-opacity', '1');
    };

    const updateGallery = (nextIndex: number, isReverse = false) => {
        const gallery = containerRef.current;
        if (!gallery || !uniteRef.current) return;

        // determine direction animation arrays
        const topAnim = isReverse ? flipAnimationTopReverse : flipAnimationTop;
        const bottomAnim = isReverse
            ? flipAnimationBottomReverse
            : flipAnimationBottom;

        gallery.querySelector('.overlay-top')?.animate(topAnim, flipTiming);
        gallery.querySelector('.overlay-bottom')?.animate(bottomAnim, flipTiming);

        // hide title
        gallery.style.setProperty('--title-y', '-1rem');
        gallery.style.setProperty('--title-opacity', '0');
        gallery.setAttribute('data-title', '');

        // update images with slight delay so animation looks continuous
        uniteRef.current.forEach((el, idx) => {
            const delay =
                (isReverse && (idx !== 1 && idx !== 2)) ||
                    (!isReverse && (idx === 1 || idx === 2))
                    ? FLIP_SPEED - 200
                    : 0;

            setTimeout(() => setActiveImage(el as HTMLElement), delay);
        });

        // reveal new title roughly half‑way through animation
        setTimeout(setImageTitle, FLIP_SPEED * 0.5);
    };

    const updateIndex = (increment: number) => {
        if (images.length === 0) return;
        const inc = Number(increment);
        const newIndex = (currentIndex + inc + images.length) % images.length;
        const isReverse = inc < 0;
        setCurrentIndex(newIndex);
        updateGallery(newIndex, isReverse);
    };

    if (!images.length) return null;

    return (
        <div className='flex items-center justify-center font-sans py-10'>
            <div
                className='relative bg-white/10 border border-white/25 p-2 rounded-xl backdrop-blur-sm shadow-xl'
                style={{ '--gallery-bg-color': 'rgba(255 255 255 / 0.075)' } as React.CSSProperties}
            >
                {/* flip gallery */}
                <div
                    id='flip-gallery'
                    ref={containerRef}
                    className='relative w-[280px] h-[400px] sm:w-[320px] sm:h-[480px] md:w-[400px] md:h-[600px] text-center'
                    style={{ perspective: '800px' }}
                >
                    <div className='top unite bg-no-repeat rounded-t-lg'></div>
                    <div className='bottom unite bg-no-repeat rounded-b-lg'></div>
                    <div className='overlay-top unite bg-no-repeat rounded-t-lg'></div>
                    <div className='overlay-bottom unite bg-no-repeat rounded-b-lg'></div>
                </div>

                {/* navigation */}
                <div className='absolute top-full right-0 mt-4 flex gap-3'>
                    <button
                        type='button'
                        onClick={() => updateIndex(-1)}
                        title='Previous'
                        className='p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all active:scale-95 backdrop-blur-md'
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        type='button'
                        onClick={() => updateIndex(1)}
                        title='Next'
                        className='p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all active:scale-95 backdrop-blur-md'
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* component-scoped styles that Tailwind cannot express */}
            <style jsx>{`
        #flip-gallery::after {
          content: '';
          position: absolute;
          background-color: rgba(0,0,0,0.2);
          width: 100%;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 10;
        }

        #flip-gallery::before {
          content: attr(data-title);
          color: rgba(255 255 255 / 0.9);
          font-size: 1rem;
          font-weight: 500;
          left: 0.5rem;
          position: absolute;
          top: calc(100% + 1.5rem);
          line-height: 1.5;
          opacity: var(--title-opacity, 0);
          transform: translateY(var(--title-y, 0));
          transition: opacity 500ms ease-in-out, transform 500ms ease-in-out;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          width: 70%;
          text-align: left;
        }

        #flip-gallery > * {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background-size: 100% 200%;
        }
        
        /* The original code had fixed background-size. 
           Since images can vary, we should probably use 'cover' which is added via tailwind 'bg-cover' class on elements.
           So we might not need the background-size rules if 'bg-cover' works. 
           But let's keep the positioning logic.
        */

        .top,
        .overlay-top {
          top: 0;
          transform-origin: bottom;
          background-position: top center;
        }

        .bottom,
        .overlay-bottom {
          bottom: 0;
          transform-origin: top;
          background-position: bottom center;
        }
      `}</style>
        </div>
    );
}
