"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ReactNode, useState } from "react";
import { MouseEvent } from "react";
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  scaleOnHover?: number;
  href?: string;
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  className = "",
  strength = 30,
  scaleOnHover = 1.08,
  href,
  onClick,
}: MagneticButtonProps) {

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });

  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  x.set((mouseX - centerX) * 0.4);
  y.set((mouseY - centerY) * 0.4);
};

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className={`relative overflow-hidden inline-flex items-center justify-center group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      style={{
        x: xSpring,
        y: ySpring,
        scale: hovered ? scaleOnHover : 1,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >

      {/* ✨ Glow overlay (improved) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(200,169,126,0.25), transparent 70%)",
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

    </Component>
  );
}