"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Mic } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Sonic Waveform Canvas Component
const SonicWaveformCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const lineCount = 60;
            const segmentCount = 80;
            const height = canvas.height / 2;

            for (let i = 0; i < lineCount; i++) {
                ctx.beginPath();
                const progress = i / lineCount;
                const colorIntensity = Math.sin(progress * Math.PI);
                ctx.strokeStyle = `rgba(255, 102, 0, ${colorIntensity * 0.5})`;
                ctx.lineWidth = 1.5;

                for (let j = 0; j < segmentCount + 1; j++) {
                    const x = (j / segmentCount) * canvas.width;

                    // Mouse influence
                    const distToMouse = Math.hypot(x - mouse.x, (height) - mouse.y);
                    const mouseEffect = Math.max(0, 1 - distToMouse / 400);

                    // Wave calculation
                    const noise = Math.sin(j * 0.1 + time + i * 0.2) * 20;
                    const spike = Math.cos(j * 0.2 + time + i * 0.1) * Math.sin(j * 0.05 + time) * 50;
                    const y = height + noise + spike * (1 + mouseEffect * 2);

                    if (j === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            time += 0.02;
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-20 w-full h-full bg-black pointer-events-none mix-blend-screen" />;
};


// The main hero component
const SonicWaveformHero = () => {
    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2 + 0.5,
                duration: 0.8,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div
            className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black"
        >
            <SonicWaveformCanvas />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none"></div>

            {/* Overlay HTML Content */}
            <div className="relative z-10 text-center p-6">
                <motion.div
                    custom={0}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6 backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-200">
                        Available for early access
                    </span>
                </motion.div>

                <motion.h1
                    custom={1}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.05]"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        Most Voice AI Answers<br />the Call.
                    </span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-orange-400 to-orange-600">
                        Ours Closes It.
                    </span>
                </motion.h1>

                <motion.p
                    custom={2}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto text-base md:text-lg text-gray-400 mb-12 leading-relaxed"
                >
                    Deploy AI voice employees that execute complete business workflows—from instant lead qualification to seamless CRM updates and automated appointment booking. Built for operations, not just conversations.
                </motion.p>

                <motion.div
                    custom={3}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    {/* Primary CTA — Try Live Demo */}
                    <Link
                        href="/demo"
                        id="hero-try-demo-btn"
                        className="px-8 py-4 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg shadow-lg shadow-white/25 transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]"
                    >
                        <Mic className="h-5 w-5" />
                        Try Live Demo
                    </Link>

                    {/* Secondary CTA — Sign Up */}
                    <Link
                        href="/register"
                        id="hero-signup-btn"
                        className="px-8 py-4 bg-black text-white border border-white/20 font-semibold rounded-lg shadow-lg hover:bg-white/5 transition-colors duration-300 flex items-center gap-2"
                    >
                        Sign Up Free
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default SonicWaveformHero;
