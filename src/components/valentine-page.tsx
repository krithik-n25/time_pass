"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Tranquiluxe } from "uvcanvas"
import confetti from "canvas-confetti"

export default function ValentinePage() {
    const [showResult, setShowResult] = useState(false)
    const [yesScale, setYesScale] = useState(1)
    const [noPosition, setNoPosition] = useState({ left: 62, top: 50, usePercent: true })

    const zoneRef = useRef<HTMLDivElement>(null)
    const noBtnRef = useRef<HTMLButtonElement>(null)
    const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
    const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null)
    const isMovingRef = useRef(false)
    const lastMoveTimeRef = useRef(0)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    // Preload speech synthesis voices
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices()
                if (availableVoices.length > 0) {
                    setVoices(availableVoices)
                }
            }

            // Load voices immediately if available
            loadVoices()

            // Also listen for voiceschanged event (some browsers load asynchronously)
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

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

    // Speak "I love you" using Web Speech API
    const speakLove = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance("I lobe you")

            // Try to find a nice female voice from preloaded voices
            const femaleVoice = voices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('zira') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('victoria') ||
                voice.name.toLowerCase().includes('susan') ||
                (voice.name.includes('Google') && voice.lang.startsWith('en'))
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]

            if (femaleVoice) {
                utterance.voice = femaleVoice
            }

            utterance.rate = 0.85 // Slightly slower for romantic effect
            utterance.pitch = 1.2 // Higher pitch for sweeter voice
            utterance.volume = 1

            // Small delay for dramatic effect after clicking
            setTimeout(() => {
                window.speechSynthesis.speak(utterance)
            }, 500)
        }
    }, [voices])

    const growYes = useCallback(() => {
        setYesScale(prev => Math.min(2.2, prev + 0.08))
    }, [])

    const moveNo = useCallback((px: number, py: number) => {
        if (!zoneRef.current || !noBtnRef.current) return

        // Throttle movements to prevent jittering
        const now = Date.now()
        if (now - lastMoveTimeRef.current < 50) return
        lastMoveTimeRef.current = now

        if (isMovingRef.current) return
        isMovingRef.current = true

        const z = zoneRef.current.getBoundingClientRect()
        const b = noBtnRef.current.getBoundingClientRect()

        // Calculate direction away from cursor
        const btnCenterX = b.left + b.width / 2
        const btnCenterY = b.top + b.height / 2

        let dx = btnCenterX - px
        let dy = btnCenterY - py
        const mag = Math.hypot(dx, dy) || 1
        dx /= mag
        dy /= mag

        // Add some randomness to prevent predictable patterns
        const randomAngle = (Math.random() - 0.5) * 0.8
        const cos = Math.cos(randomAngle)
        const sin = Math.sin(randomAngle)
        const newDx = dx * cos - dy * sin
        const newDy = dx * sin + dy * cos

        // Calculate new position (relative to zone)
        const currentLeft = b.left - z.left
        const currentTop = b.top - z.top

        const moveDistance = 100 + Math.random() * 50
        let newLeft = currentLeft + newDx * moveDistance
        let newTop = currentTop + newDy * moveDistance

        // Clamp to bounds with padding
        const padding = 5
        const maxLeft = z.width - b.width - padding
        const maxTop = z.height - b.height - padding

        // If hitting boundary, try to escape to a different direction
        if (newLeft <= padding || newLeft >= maxLeft || newTop <= padding || newTop >= maxTop) {
            // Pick a random safe spot away from cursor
            const safeSpots = []

            // Check corners and edges
            if (px > z.left + z.width / 2) {
                safeSpots.push({ left: padding + Math.random() * 50, top: Math.random() * maxTop })
            } else {
                safeSpots.push({ left: maxLeft - Math.random() * 50, top: Math.random() * maxTop })
            }

            if (py > z.top + z.height / 2) {
                safeSpots.push({ left: Math.random() * maxLeft, top: padding + Math.random() * 30 })
            } else {
                safeSpots.push({ left: Math.random() * maxLeft, top: maxTop - Math.random() * 30 })
            }

            // Pick a random safe spot
            const spot = safeSpots[Math.floor(Math.random() * safeSpots.length)]
            newLeft = spot.left
            newTop = spot.top
        }

        // Final clamp
        newLeft = Math.max(padding, Math.min(maxLeft, newLeft))
        newTop = Math.max(padding, Math.min(maxTop, newTop))

        setNoPosition({ left: newLeft, top: newTop, usePercent: false })
        growYes()

        // Allow next movement after transition
        setTimeout(() => {
            isMovingRef.current = false
        }, 200)
    }, [growYes])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!noBtnRef.current || showResult) return

        const b = noBtnRef.current.getBoundingClientRect()
        const btnCenterX = b.left + b.width / 2
        const btnCenterY = b.top + b.height / 2
        const distance = Math.hypot(btnCenterX - e.clientX, btnCenterY - e.clientY)

        // Trigger movement when cursor is within 120px
        if (distance < 120) {
            moveNo(e.clientX, e.clientY)
        }
    }, [moveNo, showResult])

    const handleYesClick = () => {
        setShowResult(true)
        fullScreenConfetti()
        speakLove()
    }

    // Calculate button style
    const noButtonStyle = noPosition.usePercent
        ? {
            left: `${noPosition.left}%`,
            top: `${noPosition.top}%`,
            transform: 'translate(-50%, -50%)'
        }
        : {
            left: `${noPosition.left}px`,
            top: `${noPosition.top}px`,
            transform: 'none'
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
                                    className="absolute left-[18%] top-1/2 px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none bg-[#ff3b7a] text-white hover:bg-[#ff1f68]"
                                    style={{
                                        transform: `translateY(-50%) scale(${yesScale})`,
                                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    ref={noBtnRef}
                                    onClick={(e) => e.preventDefault()}
                                    className="absolute px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    style={{
                                        ...noButtonStyle,
                                        transition: 'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                    }}
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

