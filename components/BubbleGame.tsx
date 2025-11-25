import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Trophy, Star, Music, Cloud, Sun, Heart } from "lucide-react";

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
  icon: React.ReactNode;
  popped: boolean;
}

interface PopEffect {
  id: number;
  x: number;
  y: number; // Y position relative to container
  text: string;
}

const ICONS = [
  <Star className="text-yellow-400" fill="currentColor" size={24} />,
  <Heart className="text-pink-400" fill="currentColor" size={24} />,
  <Music className="text-purple-400" fill="currentColor" size={24} />,
  <Cloud className="text-white" fill="currentColor" size={24} />,
  <Sun className="text-orange-400" fill="currentColor" size={24} />,
];

const PHRASES = [
  "Go little rockstar!",
  "Come on sweetie!",
  "You're glowing!",
  "So brave!",
  "Keep smiling!",
  "Super star!",
  "You got this!",
  "Breathe in...",
  "Awesome job!",
  "Thinking of you!",
  "I'm proud of you!",
  "I'm happy for your existence!",
];

export const BubbleGame: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spawnBubble = () => {
      if (document.hidden) return;

      const id = Date.now() + Math.random();
      const newBubble: Bubble = {
        id,
        x: 10 + Math.random() * 80, // Random position 10-90% to avoid edge clipping
        size: 70 + Math.random() * 50, // Size 70-120px
        speed: 6 + Math.random() * 4, // 6-10 seconds duration (slower is more relaxing)
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        popped: false,
      };

      setBubbles((prev) => [...prev, newBubble]);
    };

    // Spawn slightly slower to not overwhelm, but fast enough to be fun
    const interval = setInterval(spawnBubble, 1200);
    return () => clearInterval(interval);
  }, []);

  const popBubble = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    // 1. Get click coordinates relative to the container for the text effect
    let x = 50;
    let y = 50;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate percentage position
      x = ((e.clientX - rect.left) / rect.width) * 100;
      // Calculate raw pixel position from bottom (since bubbles float up) or just use CSS top
      y = e.clientY - rect.top;
    }

    // 2. Add Pop Effect
    const effectId = Date.now();
    const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPopEffects((prev) => [
      ...prev,
      { id: effectId, x, y, text: randomPhrase },
    ]);

    // 3. Mark bubble as popped (triggers fade/burst)
    setBubbles((prev) => prev.filter((b) => b.id !== id)); // Remove immediately to replace with effect

    setScore((s) => s + 1);

    // 4. Clean up effect after animation
    setTimeout(() => {
      setPopEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 1500);
  };

  const handleAnimationEnd = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="relative z-20 mx-auto max-w-3xl w-full">
      {/* Game Container */}
      <div
        ref={containerRef}
        className="bg-sky-200/50 backdrop-blur-sm rounded-[3rem] p-6 md:p-8 relative overflow-hidden h-[450px] border-4 border-dashed border-white/40 shadow-inner group cursor-crosshair"
      >
        {/* Header */}
        <div className="flex justify-between items-center relative z-10 mb-4 pointer-events-none">
          <h2 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
            <Cloud className="animate-bounce" />
            Bubble Thoughts
          </h2>
          <div className="bg-white/90 px-6 py-2 rounded-full text-sky-500 font-bold text-xl shadow-lg flex items-center gap-2 border-2 border-sky-100">
            <Trophy size={20} className="text-yellow-400 fill-current" />
            {score} Popped!
          </div>
        </div>

        <p className="text-white/80 font-medium text-center relative z-10 mb-2 pointer-events-none">
          Pop a bubble to hear a sweet secret!
        </p>

        {/* Bubble Layer */}
        <div className="absolute inset-0 overflow-hidden">
          {bubbles.map((bubble) => (
            <div
              key={bubble.id}
              onMouseDown={(e) => popBubble(e, bubble.id)}
              onAnimationEnd={() => handleAnimationEnd(bubble.id)}
              className="absolute cursor-pointer flex items-center justify-center animate-float-up active:scale-95 touch-manipulation"
              style={{
                left: `${bubble.x}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                bottom: "-150px", // Start well below
                animationDuration: `${bubble.speed}s`,
              }}
            >
              {/* The Bubble Visual */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/20 via-white/10 to-white/40 border-[3px] border-white/70 shadow-[inset_0_0_20px_rgba(255,255,255,0.6)] backdrop-blur-[2px] flex items-center justify-center hover:bg-white/20 transition-colors">
                {/* Reflection spot */}
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[15%] bg-white rounded-[50%] opacity-80 rotate-[-45deg] blur-[1px]"></div>
                <div className="absolute bottom-[15%] right-[15%] w-[10%] h-[10%] bg-white rounded-full opacity-40 blur-[2px]"></div>

                {/* Icon inside */}
                <div className="opacity-90 drop-shadow-lg transform hover:rotate-12 transition-transform scale-110">
                  {bubble.icon}
                </div>
              </div>
            </div>
          ))}

          {/* Pop Effects Layer */}
          {popEffects.map((effect) => (
            <div
              key={effect.id}
              className="absolute pointer-events-none"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Burst Ring */}
              <div className="absolute inset-0 -m-8 w-16 h-16 border-4 border-white rounded-full animate-burst"></div>

              {/* Sparkles */}
              <Sparkles
                className="absolute -top-8 -right-8 text-yellow-300 animate-pulse"
                size={24}
              />
              <Sparkles
                className="absolute -bottom-4 -left-8 text-white animate-pulse"
                size={16}
              />

              {/* Text */}
              <div className="animate-float-text whitespace-nowrap">
                <span className="text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] stroke-black tracking-wide bg-sky-400/50 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white">
                  {effect.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative background elements inside the game to give depth */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
