"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Tranquiluxe } from "uvcanvas"
import confetti from "canvas-confetti"

export default function ValentinePage() {
    const [showResult, setShowResult] = useState(false)
    const [yesScale, setYesScale] = useState(1)
    const [noPosition, setNoPosition] = useState({ left: "62%", top: "50%" })
    const [noTransform, setNoTransform] = useState("translateY(-50%)")

    const zoneRef = useRef<HTMLDivElement>(null)
    const noBtnRef = useRef<HTMLButtonElement>(null)
    const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
    const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null)

    // Initialize confetti
    useEffect(() => {
        if (confettiCanvasRef.current) {
            const resizeCanvas = () => {
                if (!confettiCanvasRef.current) return
                const dpr = Math.max(1, window.devicePixelRatio || 1)
                confettiCanvasRef.current.width = Math.floor(window.innerWidth * dpr)
                confettiCanvasRef.current.height = Math.floor(window.innerHeight * dpr)
                confettiCanvasRef.current.style.width = "100vw"
                confettiCanvasRef.current.style.height = "100vh"
            }

            resizeCanvas()
            window.addEventListener("resize", resizeCanvas)
            window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 150))

            confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
                resize: false,
                useWorker: true
            })

            return () => {
                window.removeEventListener("resize", resizeCanvas)
            }
        }
    }, [])

    const fullScreenConfetti = () => {
        if (!confettiInstanceRef.current) return

        const end = Date.now() + 1600
        const instance = confettiInstanceRef.current

        const frame = () => {
            instance({
                particleCount: 12,
                spread: 90,
                startVelocity: 45,
                ticks: 180,
                origin: { x: Math.random(), y: Math.random() * 0.3 }
            })
            if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()

        setTimeout(() => {
            instance({
                particleCount: 300,
                spread: 140,
                startVelocity: 60,
                ticks: 220,
                origin: { x: 0.5, y: 0.55 }
            })
        }, 300)
    }

    const growYes = useCallback(() => {
        setYesScale(prev => Math.min(2.2, prev + 0.1))
    }, [])

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

    const moveNo = useCallback((px: number, py: number) => {
        if (!zoneRef.current || !noBtnRef.current) return

        const z = zoneRef.current.getBoundingClientRect()
        const b = noBtnRef.current.getBoundingClientRect()

        let dx = (b.left + b.width / 2) - px
        let dy = (b.top + b.height / 2) - py
        const mag = Math.hypot(dx, dy) || 1
        dx /= mag
        dy /= mag

        let newLeft = (b.left - z.left) + dx * 150
        let newTop = (b.top - z.top) + dy * 150

        newLeft = clamp(newLeft, 0, z.width - b.width)
        newTop = clamp(newTop, 0, z.height - b.height)

        setNoPosition({ left: `${newLeft}px`, top: `${newTop}px` })
        setNoTransform("none")
        growYes()
    }, [growYes])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!noBtnRef.current) return

        const b = noBtnRef.current.getBoundingClientRect()
        const d = Math.hypot(
            (b.left + b.width / 2) - e.clientX,
            (b.top + b.height / 2) - e.clientY
        )
        if (d < 140) moveNo(e.clientX, e.clientY)
    }, [moveNo])

    const handleYesClick = () => {
        setShowResult(true)
        fullScreenConfetti()
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <Tranquiluxe />
            </div>

            {/* Confetti Canvas */}
            <canvas
                ref={confettiCanvasRef}
                className="fixed inset-0 w-screen h-screen pointer-events-none z-[9999]"
            />

            {/* Main Content */}
            <main className="relative z-10 min-h-screen grid place-items-center p-4">
                <div className="w-full max-w-[720px] p-6 bg-white/80 backdrop-blur-md rounded-[22px] text-center shadow-[0_18px_60px_rgba(0,0,0,0.15)]">
                    {/* Cute Animal SVG */}
                    <svg
                        className="w-[min(260px,80vw)] mx-auto mb-3 drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)]"
                        viewBox="0 0 320 240"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="fur" x1="0" x2="1">
                                <stop offset="0" stopColor="#f7c7a1" />
                                <stop offset="1" stopColor="#f2a97b" />
                            </linearGradient>
                            <linearGradient id="heart" x1="0" x2="1">
                                <stop offset="0" stopColor="#ff4d7d" />
                                <stop offset="1" stopColor="#ff1f68" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M250 50 C250 33 270 25 282 38 C294 25 314 33 314 50 C314 78 282 92 282 106 C282 92 250 78 250 50Z"
                            fill="url(#heart)"
                        />

                        <path
                            d="M90 120 C90 70 140 40 190 60 C240 40 290 70 290 120 C290 180 240 210 190 210 C140 210 90 180 90 120Z"
                            fill="url(#fur)"
                        />

                        <path d="M110 92 L95 55 L140 78 Z" fill="#f2a97b" />
                        <path d="M270 92 L285 55 L240 78 Z" fill="#f2a97b" />

                        <circle cx="160" cy="130" r="8" />
                        <circle cx="220" cy="130" r="8" />

                        <path
                            d="M190 144 C186 144 182 148 182 152 C182 160 190 164 190 170 C190 164 198 160 198 152 C198 148 194 144 190 144Z"
                            fill="#ff7aa2"
                        />
                    </svg>

                    <h1 className="text-[clamp(26px,4vw,44px)] font-bold my-3 text-gray-800">
                        Anuskha! will you be my valentine?👉👈
                    </h1>

                    {!showResult && (
                        <>
                            <div
                                ref={zoneRef}
                                className="relative w-full max-w-[520px] h-[150px] mx-auto touch-none"
                                onPointerMove={handlePointerMove}
                            >
                                <button
                                    onClick={handleYesClick}
                                    className="absolute left-[18%] top-1/2 px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none transition-all duration-100 ease-out bg-[#ff3b7a] text-white hover:bg-[#ff1f68]"
                                    style={{ transform: `translateY(-50%) scale(${yesScale})` }}
                                >
                                    Yes
                                </button>
                                <button
                                    ref={noBtnRef}
                                    onClick={(e) => e.preventDefault()}
                                    className="absolute px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none transition-all duration-100 ease-out bg-gray-200 text-gray-800"
                                    style={{ left: noPosition.left, top: noPosition.top, transform: noTransform }}
                                >
                                    No
                                </button>
                            </div>

                            <p className="mt-3 text-sm opacity-70 text-gray-600">
                                "No" seems a bit shy 😈
                            </p>
                        </>
                    )}

                    {showResult && (
                        <div className="mt-5 animate-[pop_0.35s_ease]">
                            <h2 className="text-[clamp(30px,4.5vw,46px)] font-bold my-3 text-gray-800">
                                YAY!!!! 🎉🎉🎉🎉
                            </h2>
                            <img
                                className="w-[min(380px,90vw)] mx-auto block rounded-lg"
                                src="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
                                alt="Fireworks"
                            />
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
        @keyframes pop {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
