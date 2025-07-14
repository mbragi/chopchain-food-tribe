import React, { useEffect, useState } from "react";

// Food emoji icons for loader
const foodIcons = ["🍚", "🍢", "🍌", "🍲", "🍗", "🥟"];

export function AnimeLoader({ size = 48 }: { size?: number }) {
 const [iconIndex, setIconIndex] = useState(0);

 // Cycle through food icons every 600ms
 useEffect(() => {
  const interval = setInterval(() => {
   setIconIndex((i) => (i + 1) % foodIcons.length);
  }, 600);
  return () => clearInterval(interval);
 }, []);

 return (
  <div
   className="relative flex items-center justify-center"
   style={{ width: size, height: size }}
   aria-label="Loading..."
  >
   {/* Circular background */}
   <div
    className="absolute inset-0 rounded-full border-4 border-primary animate-spin-slow"
    style={{ borderTopColor: "transparent" }}
   />
   {/* Food icon */}
   <span className="text-3xl z-10 animate-pop">
    {foodIcons[iconIndex]}
   </span>
   {/* Anime sparkles (SVG) */}
   <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 48 48"
    fill="none"
   >
    <g className="animate-sparkle">
     <circle cx="12" cy="12" r="2" fill="#FFD700" opacity="0.8" />
     <circle cx="36" cy="16" r="1.5" fill="#FFD700" opacity="0.7" />
     <circle cx="24" cy="6" r="1.2" fill="#FFD700" opacity="0.6" />
     <circle cx="40" cy="32" r="1.8" fill="#FFD700" opacity="0.8" />
     <circle cx="10" cy="34" r="1.3" fill="#FFD700" opacity="0.7" />
    </g>
   </svg>
   <style jsx>{`
        .animate-spin-slow {
          animation: spin 1.6s linear infinite;
        }
        .animate-pop {
          animation: pop 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        .animate-sparkle {
          animation: sparkle 1.2s ease-in-out infinite alternate;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          100% { transform: scale(1.18) rotate(-8deg); }
        }
        @keyframes sparkle {
          0% { opacity: 0.7; }
          100% { opacity: 1; filter: drop-shadow(0 0 6px #FFD700); }
        }
      `}</style>
  </div>
 );
} 