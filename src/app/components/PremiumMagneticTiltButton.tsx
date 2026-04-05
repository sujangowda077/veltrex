"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MouseEvent, ReactNode, useRef, useState } from "react";
import ConfettiBurst from "@/app/components/ConfettiBurst";

interface PremiumMagneticTiltButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  magneticStrength?: number;
  tiltMaxAngle?: number;
  glowColor?: string;
  glowIntensity?: number;
  scaleOnHover?: number;
  springConfig?: { stiffness: number; damping: number };
}

export default function PremiumMagneticTiltButton({
  children,
  className = "",
  href,
  onClick,
  magneticStrength = 28,
  tiltMaxAngle = 12,
  glowColor = "#c8a97e",
  glowIntensity = 0.6,
  scaleOnHover = 1.08,
  springConfig = { stiffness: 180, damping: 20 },
}: PremiumMagneticTiltButtonProps) {
  const ref = useRef<any>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

 const [hovered, setHovered] = useState(false);

  const rotateX = useTransform(y, [-magneticStrength, magneticStrength], [tiltMaxAngle, -tiltMaxAngle]);
  const rotateY = useTransform(x, [-magneticStrength, magneticStrength], [-tiltMaxAngle, tiltMaxAngle]);

  const glowOpacity = useTransform(x, [-magneticStrength, magneticStrength], [0.1, glowIntensity]);
  const glowScale = useTransform(x, [-magneticStrength, magneticStrength], [0.9, 1.3]);

  const [burstTrigger, setBurstTrigger] = useState(false);

  const handleClick = (e: MouseEvent) => {
    onClick?.();
    setBurstTrigger(true);
    setTimeout(() => setBurstTrigger(false), 100);
  };

  const handleMouseMove = (
  e: MouseEvent<HTMLElement>
) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <>
      <ConfettiBurst trigger={burstTrigger} />
      <Component
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
        onMouseEnter={() => setHovered(true)}
onMouseLeave={handleMouseLeave}

style={{
  x: xSpring,
  y: ySpring,
  scale: hovered ? scaleOnHover : 1,
}}
      >
        {/* Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 40px 15px ${glowColor}`,
            opacity: glowOpacity,
            scale: glowScale,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Inner shine gradient on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={{ opacity: 0 }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full h-full px-10 py-5">
          {children}
        </div>
      </Component>
    </>
  );
}