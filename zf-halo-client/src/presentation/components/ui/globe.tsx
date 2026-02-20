import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Globe({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // longitude latitude
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.1 },
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.01;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div
            className={cn(
                "relative mx-auto flex h-full max-w-[600px] items-center justify-center overflow-hidden grayscale-0",
                className,
            )}
        >
            <div className="absolute inset-0 z-0 bg-radial-gradient from-blue-500/20 to-transparent blur-3xl" />
            <canvas
                ref={canvasRef}
                style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
                className="size-full opacity-[0.9] transition-opacity duration-300 ease-in-out hover:opacity-100"
            />
        </div>
    );
}
