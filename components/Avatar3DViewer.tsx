import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Avatar3DViewerProps {
    avatarUrl: string;
    sceneBackgroundUrl: string;
    overlayGradient: string;
    particleColor: string;
    effects: string[];
    glowColor?: string;
}

// ---- Canvas Particle System with Mouse Interaction ----
function ParticleCanvas({ particleColor, glowColor, effects, mouseRef, zoomRef }: {
    particleColor: string;
    glowColor: string;
    effects: string[];
    mouseRef: React.RefObject<{ x: number; y: number; clicking: boolean; clickX: number; clickY: number; clickFrame: number }>;
    zoomRef: React.RefObject<number>;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    const effectColors: Record<string, string> = {
        sparkles: '#FFD700', hearts: '#ff6b81', petals: '#f472b6', neon: '#a855f7',
        snow: '#e0f2fe', fire: '#ff7675', bubbles: '#74b9ff', lightning: '#fbbf24',
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;
        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w * 2;
            canvas.height = h * 2;
            ctx.setTransform(2, 0, 0, 2, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const colors = [particleColor, glowColor, ...effects.map(e => effectColors[e] || particleColor)];

        interface P {
            x: number; y: number; vx: number; vy: number;
            size: number; opacity: number; color: string;
            life: number; maxLife: number; type: number;
            isBurst?: boolean;
        }

        const particles: P[] = [];

        const spawn = (fromBottom = true): P => ({
            x: Math.random() * w,
            y: fromBottom ? h + 5 : Math.random() * h,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 2 + 0.8),
            size: Math.random() * 5 + 1.5,
            opacity: Math.random() * 0.7 + 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0, maxLife: 100 + Math.random() * 120, type: Math.floor(Math.random() * 3),
        });

        const spawnBurst = (bx: number, by: number): P => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            return {
                x: bx, y: by,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 2,
                opacity: 0.9,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 0, maxLife: 40 + Math.random() * 30, type: Math.floor(Math.random() * 3),
                isBurst: true,
            };
        };

        for (let i = 0; i < 50; i++) {
            const p = spawn(false);
            p.life = Math.random() * p.maxLife;
            particles.push(p);
        }

        let t = 0;
        let lastClickFrame = -999;
        let running = true;

        const animate = () => {
            if (!running) return;
            t++;
            ctx.clearRect(0, 0, w, h);

            const mx = mouseRef.current?.x ?? 0.5;
            const my = mouseRef.current?.y ?? 0.5;

            // Click burst
            if (mouseRef.current && mouseRef.current.clickFrame > lastClickFrame) {
                lastClickFrame = mouseRef.current.clickFrame;
                const bx = mouseRef.current.clickX * w;
                const by = mouseRef.current.clickY * h;
                for (let i = 0; i < 25; i++) {
                    particles.push(spawnBurst(bx, by));
                }
            }

            // Ambient spawning
            if (particles.length < 120 && t % 2 === 0) {
                particles.push(spawn(true));
            }

            // Mouse attract force
            const attractX = mx * w;
            const attractY = my * h;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                // Gentle mouse attraction
                if (!p.isBurst) {
                    const dx = attractX - p.x;
                    const dy = attractY - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150 && dist > 5) {
                        p.vx += (dx / dist) * 0.08;
                        p.vy += (dy / dist) * 0.08;
                    }
                }

                p.x += p.vx + (p.isBurst ? 0 : Math.sin(p.life * 0.03 + i) * 0.5);
                p.y += p.vy;
                if (p.isBurst) {
                    p.vx *= 0.96;
                    p.vy *= 0.96;
                }
                p.life++;

                if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > w + 20) {
                    particles.splice(i, 1);
                    continue;
                }

                const prog = p.life / p.maxLife;
                const fadeIn = p.isBurst ? 1 : Math.min(prog * 4, 1);
                const fadeOut = prog > 0.7 ? 1 - (prog - 0.7) / 0.3 : 1;
                const alpha = p.opacity * fadeIn * fadeOut;

                ctx.globalAlpha = alpha;

                // Glow
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                grd.addColorStop(0, p.color + '88');
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = p.color;
                ctx.beginPath();
                if (p.type === 0) {
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                } else if (p.type === 1) {
                    ctx.moveTo(p.x, p.y - p.size);
                    ctx.lineTo(p.x + p.size, p.y);
                    ctx.lineTo(p.x, p.y + p.size);
                    ctx.lineTo(p.x - p.size, p.y);
                } else {
                    for (let j = 0; j < 4; j++) {
                        const a = (j / 4) * Math.PI * 2 + t * 0.02;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x + Math.cos(a) * p.size * 1.5, p.y + Math.sin(a) * p.size * 1.5);
                    }
                }
                ctx.fill();
            }

            // Mouse cursor glow
            ctx.globalAlpha = 0.15;
            const cursorGrd = ctx.createRadialGradient(attractX, attractY, 0, attractX, attractY, 80);
            cursorGrd.addColorStop(0, glowColor + '44');
            cursorGrd.addColorStop(1, 'transparent');
            ctx.fillStyle = cursorGrd;
            ctx.beginPath();
            ctx.arc(attractX, attractY, 80, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
            frameRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            running = false;
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [particleColor, glowColor, effects]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[2] pointer-events-none" />;
}

// ---- Main Component ----
const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({
    avatarUrl, sceneBackgroundUrl, overlayGradient, particleColor, effects, glowColor = '#a855f7'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5, clicking: false, clickX: 0.5, clickY: 0.5, clickFrame: 0 });
    const zoomRef = useRef(1);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
    const clickCountRef = useRef(0);

    // Mouse move -> parallax + ring tilt
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        mouseRef.current.x = nx;
        mouseRef.current.y = ny;
        setMouse({ x: nx, y: ny });

        if (isDragging) {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setDragRotation({
                x: dragStart.current.rotX + dy * 0.3,
                y: dragStart.current.rotY + dx * 0.3,
            });
        }
    }, [isDragging]);

    // Mouse down -> start drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX, y: e.clientY,
            rotX: dragRotation.x, rotY: dragRotation.y,
        };
    }, [dragRotation]);

    // Mouse up -> end drag + trigger click burst
    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        const movedDist = Math.abs(e.clientX - dragStart.current.x) + Math.abs(e.clientY - dragStart.current.y);
        setIsDragging(false);

        // If barely moved, count as click -> burst particles
        if (movedDist < 5) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                clickCountRef.current++;
                mouseRef.current.clickX = (e.clientX - rect.left) / rect.width;
                mouseRef.current.clickY = (e.clientY - rect.top) / rect.height;
                mouseRef.current.clickFrame = clickCountRef.current;
            }
        }
    }, []);

    // Mouse wheel -> zoom (native listener for passive:false)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setZoom(prev => {
                const next = Math.max(0.6, Math.min(1.8, prev + delta));
                zoomRef.current = next;
                return next;
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // Mouse leave -> reset
    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
        mouseRef.current.x = 0.5;
        mouseRef.current.y = 0.5;
        setMouse({ x: 0.5, y: 0.5 });
    }, []);

    // Touch support
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || !e.touches[0]) return;
        const nx = (e.touches[0].clientX - rect.left) / rect.width;
        const ny = (e.touches[0].clientY - rect.top) / rect.height;
        mouseRef.current.x = nx;
        mouseRef.current.y = ny;
        setMouse({ x: nx, y: ny });

        if (isDragging) {
            const dx = e.touches[0].clientX - dragStart.current.x;
            const dy = e.touches[0].clientY - dragStart.current.y;
            setDragRotation({
                x: dragStart.current.rotX + dy * 0.3,
                y: dragStart.current.rotY + dx * 0.3,
            });
        }
    }, [isDragging]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!e.touches[0]) return;
        setIsDragging(true);
        dragStart.current = {
            x: e.touches[0].clientX, y: e.touches[0].clientY,
            rotX: dragRotation.x, rotY: dragRotation.y,
        };
    }, [dragRotation]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Derived transforms
    const parallaxX = (mouse.x - 0.5) * 30;
    const parallaxY = (mouse.y - 0.5) * 20;
    const sceneBgX = (mouse.x - 0.5) * -15;
    const sceneBgY = (mouse.y - 0.5) * -10;

    const combinedRotX = parallaxY + dragRotation.x;
    const combinedRotY = -parallaxX + dragRotation.y;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full rounded-2xl overflow-hidden select-none"
            style={{ perspective: '800px', cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Scene background - parallax shift */}
            <div
                className="absolute inset-0 z-0 transition-transform duration-200 ease-out"
                style={{
                    backgroundImage: `url(${sceneBackgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(1.15) translate(${sceneBgX}px, ${sceneBgY}px)`,
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 z-[1]" style={{ background: overlayGradient }} />
            <div className="absolute inset-0 z-[1]" style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)'
            }} />

            {/* Canvas particles */}
            <ParticleCanvas particleColor={particleColor} glowColor={glowColor} effects={effects} mouseRef={mouseRef} zoomRef={zoomRef} />

            {/* 3D Interactive Layer - responds to mouse + drag */}
            <div className="absolute inset-0 z-[3] pointer-events-none flex items-center justify-center" style={{
                transform: `rotateX(${combinedRotX * 0.15}deg) rotateY(${combinedRotY * 0.15}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}>
                {/* Outer ring */}
                <div className="absolute ring-orbit-1" style={{
                    width: '300px', height: '300px',
                    borderWidth: '2px', borderStyle: 'solid',
                    borderTopColor: `${glowColor}cc`,
                    borderRightColor: `${glowColor}44`,
                    borderBottomColor: `${glowColor}cc`,
                    borderLeftColor: `${glowColor}44`,
                    borderRadius: '50%',
                    boxShadow: `0 0 40px ${glowColor}44, inset 0 0 40px ${glowColor}22`,
                    transform: `rotateX(${60 + combinedRotX * 0.2}deg)`,
                    transformStyle: 'preserve-3d',
                }} />

                {/* Middle ring - counter rotating */}
                <div className="absolute ring-orbit-2" style={{
                    width: '260px', height: '260px',
                    borderWidth: '1.5px', borderStyle: 'solid',
                    borderTopColor: 'transparent',
                    borderRightColor: `${particleColor}88`,
                    borderBottomColor: 'transparent',
                    borderLeftColor: `${particleColor}88`,
                    borderRadius: '50%',
                    boxShadow: `0 0 25px ${particleColor}33`,
                    transform: `rotateX(${70 + combinedRotX * 0.3}deg) rotateY(${30 + combinedRotY * 0.2}deg)`,
                    transformStyle: 'preserve-3d',
                }} />

                {/* Pulse glow */}
                <div className="absolute pulse-glow" style={{
                    width: '220px', height: '220px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${glowColor}22 0%, ${glowColor}08 50%, transparent 70%)`,
                    boxShadow: `0 0 60px ${glowColor}33`,
                }} />

                {/* Hexagon */}
                <div className="absolute hex-rotate" style={{ width: '280px', height: '280px' }}>
                    <svg viewBox="0 0 280 280" className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${glowColor}88)` }}>
                        <polygon
                            points="140,10 250,75 250,205 140,270 30,205 30,75"
                            fill="none"
                            stroke={`${glowColor}44`}
                            strokeWidth="1.5"
                            strokeDasharray="20 10"
                        />
                    </svg>
                </div>
            </div>

            {/* Scan lines */}
            <div className="absolute inset-0 z-[4] pointer-events-none scan-lines" style={{
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${glowColor}08 2px, ${glowColor}08 4px)`,
                mixBlendMode: 'overlay',
            }} />

            {/* Scan beam */}
            <div className="absolute inset-x-0 z-[4] pointer-events-none scan-beam" style={{
                height: '3px',
                background: `linear-gradient(90deg, transparent 0%, ${glowColor}66 50%, transparent 100%)`,
                boxShadow: `0 0 20px ${glowColor}44, 0 0 40px ${glowColor}22`,
            }} />

            {/* Avatar - responds to mouse parallax + drag rotation + zoom */}
            <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
                <div
                    className="relative avatar-3d-float"
                    style={{
                        transform: `
                            perspective(600px)
                            rotateX(${combinedRotX * 0.2}deg)
                            rotateY(${combinedRotY * 0.3}deg)
                            translateX(${parallaxX * 0.5}px)
                            translateY(${parallaxY * 0.5}px)
                            scale(${zoom})
                        `,
                        transformStyle: 'preserve-3d',
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    }}
                >
                    {/* Large glow */}
                    <div className="absolute -inset-16 rounded-full avatar-glow-pulse" style={{
                        background: `radial-gradient(circle, ${glowColor}40 0%, ${glowColor}15 40%, transparent 70%)`,
                    }} />
                    <div className="absolute -inset-8 rounded-full" style={{
                        background: `radial-gradient(circle, ${glowColor}25 0%, transparent 60%)`,
                        filter: 'blur(10px)',
                    }} />

                    {/* Avatar */}
                    <img
                        src={avatarUrl}
                        alt="Virtual Avatar"
                        className="relative w-44 h-44 object-contain"
                        style={{
                            filter: `drop-shadow(0 0 30px ${glowColor}88) drop-shadow(0 0 60px ${glowColor}44)`,
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(30px)',
                        }}
                    />

                    {/* Reflection */}
                    <img
                        src={avatarUrl}
                        alt=""
                        className="absolute top-full left-0 w-44 h-20 object-contain object-top"
                        style={{
                            transform: 'scaleY(-1) translateY(-5px)',
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 80%)',
                            filter: `blur(2px) drop-shadow(0 0 10px ${glowColor}44)`,
                            opacity: 0.3,
                        }}
                    />
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 z-[6] pointer-events-none flex flex-col gap-1">
                <div style={{ width: '30px', height: '2px', backgroundColor: `${glowColor}88` }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: `${glowColor}55` }} />
                <div style={{ width: '10px', height: '2px', backgroundColor: `${glowColor}33` }} />
            </div>
            <div className="absolute top-4 right-4 z-[6] pointer-events-none flex flex-col items-end gap-1">
                <div style={{ width: '30px', height: '2px', backgroundColor: `${glowColor}88` }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: `${glowColor}55` }} />
                <div style={{ width: '10px', height: '2px', backgroundColor: `${glowColor}33` }} />
            </div>

            {/* Zoom indicator */}
            {zoom !== 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[7] pointer-events-none">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{
                        color: `${glowColor}cc`, backgroundColor: 'rgba(0,0,0,0.5)',
                        border: `1px solid ${glowColor}44`,
                    }}>
                        {Math.round(zoom * 100)}%
                    </span>
                </div>
            )}

            {/* Interaction hint */}
            <div className="absolute bottom-3 right-3 z-[7] pointer-events-none flex flex-col items-end gap-0.5">
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{
                    color: `${glowColor}66`, backgroundColor: 'rgba(0,0,0,0.3)',
                }}>
                    Drag: Rotate | Scroll: Zoom | Click: Burst
                </span>
            </div>

            {/* Data readout */}
            <div className="absolute bottom-10 left-4 z-[6] pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full data-blink" style={{ backgroundColor: glowColor }} />
                    <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: `${glowColor}aa` }}>INTERACTIVE 3D</span>
                </div>
                <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="data-bar" style={{
                            width: '3px',
                            height: `${8 + Math.random() * 12}px`,
                            backgroundColor: `${glowColor}${i < 5 ? '88' : '44'}`,
                            animationDelay: `${i * 0.1}s`,
                        }} />
                    ))}
                </div>
            </div>

            {/* Bottom vignette */}
            <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent z-[4] pointer-events-none" />

            <style>{`
                @keyframes avatar-3d-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .avatar-3d-float {
                    animation: avatar-3d-float 4s ease-in-out infinite;
                }

                @keyframes ring-orbit-1 {
                    from { transform: rotateX(60deg) rotateZ(0deg); }
                    to { transform: rotateX(60deg) rotateZ(360deg); }
                }
                .ring-orbit-1 { animation: ring-orbit-1 10s linear infinite; }

                @keyframes ring-orbit-2 {
                    from { transform: rotateX(70deg) rotateY(30deg) rotateZ(360deg); }
                    to { transform: rotateX(70deg) rotateY(30deg) rotateZ(0deg); }
                }
                .ring-orbit-2 { animation: ring-orbit-2 7s linear infinite; }

                @keyframes hex-rotate {
                    from { transform: rotateZ(0deg); }
                    to { transform: rotateZ(360deg); }
                }
                .hex-rotate { animation: hex-rotate 20s linear infinite; opacity: 0.6; }

                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 0.3; }
                }
                .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

                @keyframes avatar-glow-pulse {
                    0%, 100% { opacity: 0.7; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                }
                .avatar-glow-pulse { animation: avatar-glow-pulse 2.5s ease-in-out infinite; }

                @keyframes scan-beam {
                    0% { top: -5%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 105%; opacity: 0; }
                }
                .scan-beam { animation: scan-beam 4s ease-in-out infinite; }

                .scan-lines { animation: scan-lines-flicker 0.1s infinite; }
                @keyframes scan-lines-flicker {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.6; }
                }

                @keyframes data-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .data-blink { animation: data-blink 1.5s ease-in-out infinite; }

                @keyframes data-bar-bounce {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.4); }
                }
                .data-bar {
                    animation: data-bar-bounce 0.8s ease-in-out infinite;
                    transform-origin: bottom;
                    border-radius: 1px;
                }
            `}</style>
        </div>
    );
};

export default Avatar3DViewer;
