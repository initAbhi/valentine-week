import AnoAI from "@/components/ui/animated-shader-background";

export default function DemoPage() {
    return (
        <div className="w-full h-screen bg-black relative">
            <div className="absolute inset-0 z-0">
                <AnoAI />
            </div>
            <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
                <h1 className="text-4xl font-bold text-white tracking-wider mix-blend-overlay">Aurora Demo</h1>
            </div>
        </div>
    );
};
