import React from 'react';

// Icon = simple-icons slug + brand hex.
// Rings placed concentrically. Alternating rings spin in opposite directions.
const RINGS = [
  {
    radius: 160,
    duration: 40,
    direction: 'normal',
    size: 44,
    blur: 0,
    opacity: 0.95,
    icons: [
      { slug: 'python',     color: '3776AB' },
      { slug: 'react',      color: '61DAFB' },
      { slug: 'javascript', color: 'F7DF1E' },
      { slug: 'openai',     color: '000000' },
      { slug: 'github',     color: '000000' },
    ],
  },
  {
    radius: 280,
    duration: 60,
    direction: 'reverse',
    size: 40,
    blur: 1,
    opacity: 0.8,
    icons: [
      { slug: 'typescript', color: '3178C6' },
      { slug: 'nodedotjs',  color: '5FA04E' },
      { slug: 'docker',     color: '2496ED' },
      { slug: 'tensorflow', color: 'FF6F00' },
      { slug: 'pytorch',    color: 'EE4C2C' },
      { slug: 'linux',      color: 'FCC624' },
      { slug: 'mongodb',    color: '47A248' },
    ],
  },
  {
    radius: 410,
    duration: 82,
    direction: 'normal',
    size: 36,
    blur: 2,
    opacity: 0.65,
    icons: [
      { slug: 'kubernetes', color: '326CE5' },
      { slug: 'postgresql', color: '4169E1' },
      { slug: 'git',        color: 'F05032' },
      { slug: 'vercel',     color: '000000' },
      { slug: 'tailwindcss',color: '06B6D4' },
      { slug: 'nextdotjs',  color: '000000' },
      { slug: 'go',         color: '00ADD8' },
      { slug: 'figma',      color: 'F24E1E' },
      { slug: 'redis',      color: 'FF4438' },
    ],
  },
  {
    radius: 550,
    duration: 105,
    direction: 'reverse',
    size: 32,
    blur: 3,
    opacity: 0.5,
    icons: [
      { slug: 'rust',      color: '000000' },
      { slug: 'firebase',  color: 'DD2C00' },
      { slug: 'vite',      color: '646CFF' },
      { slug: 'html5',     color: 'E34F26' },
      { slug: 'css',       color: '663399' },
      { slug: 'graphql',   color: 'E10098' },
      { slug: 'jupyter',   color: 'F37626' },
      { slug: 'cplusplus', color: '00599C' },
      { slug: 'kotlin',    color: '7F52FF' },
      { slug: 'flutter',   color: '02569B' },
      { slug: 'svelte',    color: 'FF3E00' },
    ],
  },
];

export default function TechCloud() {
  return (
    <div className="tech-cloud" aria-hidden="true">
      {RINGS.map((ring, ri) => (
        <div
          key={ri}
          className="tech-ring"
          style={{
            animationDuration: `${ring.duration}s`,
            animationDirection: ring.direction,
          }}
        >
          {ring.icons.map((icon, i) => {
            const angle = (360 / ring.icons.length) * i;
            const half = ring.size / 2;
            return (
              <span
                key={icon.slug + i}
                className="tech-orbit"
                style={{
                  transform: `rotate(${angle}deg) translate(${ring.radius}px)`,
                  marginLeft: `-${half}px`,
                  marginTop: `-${half}px`,
                }}
              >
                <img
                  src={`https://cdn.simpleicons.org/${icon.slug}/${icon.color}`}
                  alt=""
                  className="tech-logo"
                  style={{
                    width: `${ring.size}px`,
                    height: `${ring.size}px`,
                    opacity: ring.opacity,
                    filter: ring.blur ? `blur(${ring.blur}px)` : 'none',
                    transform: `rotate(${-angle}deg)`,
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
