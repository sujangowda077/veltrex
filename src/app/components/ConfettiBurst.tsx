"use client";

import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadConfettiPreset } from "@tsparticles/preset-confetti";
import { tsParticles } from "@tsparticles/engine";

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiBurst({
  trigger,
  onComplete,
}: ConfettiBurstProps) {
  const [isActive, setIsActive] = useState(false);

  // ✅ Load preset once (required in v3+)
  useEffect(() => {
    loadConfettiPreset(tsParticles);
  }, []);

  // ✅ Handle trigger
  useEffect(() => {
    if (trigger) {
      setIsActive(true);

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  return (
    <Particles
      id="confetti-burst"
      options={{
        preset: "confetti",

        fullScreen: {
          enable: true,
          zIndex: 9999,
        },

        particles: {
          number: {
            value: 0, // controlled by emitters
          },

          color: {
            value: ["#c8a97e", "#e8c89a", "#a07848"], // GOLD
          },

          shape: {
            type: ["circle", "square"],
          },

          opacity: {
            value: 1, // preset handles fading
          },

          size: {
            value: { min: 4, max: 8 },
          },

          move: {
            enable: true,
            speed: { min: 8, max: 20 },
            gravity: {
              enable: true,
              acceleration: 15,
            },
            decay: 0.05,
            outModes: {
              default: "destroy",
            },
          },
        },

        emitters: [
          {
            direction: "top",
            life: {
              count: 1,
              duration: 0.1,
            },
            rate: {
              quantity: 120,
              delay: 0,
            },
            position: {
              x: 50,
              y: 60,
            },
          },
          {
            direction: "top-left",
            life: {
              count: 1,
              duration: 0.1,
            },
            rate: {
              quantity: 80,
              delay: 0,
            },
            position: {
              x: 30,
              y: 70,
            },
          },
          {
            direction: "top-right",
            life: {
              count: 1,
              duration: 0.1,
            },
            rate: {
              quantity: 80,
              delay: 0,
            },
            position: {
              x: 70,
              y: 70,
            },
          },
        ],

        detectRetina: true,
      }}
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}