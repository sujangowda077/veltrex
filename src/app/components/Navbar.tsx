"use client";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";

// ─── Gold tokens ──────────────────────────────────────────────────────────────
const GOLD        = "#c8a97e";
const GOLD_DIM    = "rgba(200,169,126,0.5)";
const GOLD_SOFT   = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

const navItems = [
  { href: "/",        label: "Home"     },
  { href: "/about",   label: "About"    },
  { href: "/services",label: "Services" },
  { href: "/projects",label: "Projects" },
  { href: "/contact", label: "Contact"  },
];

// ─── Magnetic hook ────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * strength);
      y.set((e.clientY - r.top - r.height / 2) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [x, y, strength]);
  return { ref, sx, sy };
}

export default function Navbar() {
  const pathname   = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const { ref: ctaRef, sx: ctaSx, sy: ctaSy } = useMagnetic(0.3);

  // Scroll-driven blur/opacity
  const { scrollY } = useScroll();
  const bgOpacity     = useTransform(scrollY, [0, 80], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ─── Main nav ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed top-0 w-full z-[900]"
        style={{ willChange: "transform" }}
      >
        {/* Frosted glass bg */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: bgOpacity }}>
          <div className="absolute inset-0 bg-[#050709]/85 backdrop-blur-2xl" />
        </motion.div>

        {/* Scroll-driven bottom border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            opacity: borderOpacity,
            background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`,
          }}
        />

        {/* Gold top hairline — always visible */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_BORDER}, transparent)` }} />

        <div className="relative z-10 max-w-[1180px] mx-auto px-6 py-4 flex justify-between items-center">

          

{/* ── Logo ──────────────────────────────────────────────────── */}
<Link href="/" className="flex items-center gap-3 group flex-shrink-0">
  <div className="relative">

    {/* Glow ring */}
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{ border: "1px solid rgba(200,169,126,0.25)" }}
      initial={{ scale: 1, opacity: 0 }}
      whileHover={{ scale: 1.3, opacity: 1 }}
      transition={{ duration: 0.4 }}
    />

    {/* LOGO IMAGE */}
    <motion.div
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-black border overflow-hidden"
      style={{ borderColor: "rgba(200,169,126,0.25)" }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
    >
      <Image
        src={logo}
        alt="Veltrex Logo"
        width={28}
        height={28}
        className="object-contain"
        priority
      />
    </motion.div>

  </div>

            {/* Wordmark */}
            <motion.div className="leading-none"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <span className="text-[1.1rem] font-black tracking-[-0.04em] text-white"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                VELTREX
              </span>
              <span className="text-[1.1rem] font-black tracking-[-0.04em]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 55%, #a07848 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                }}>
                .DEVS
              </span>
            </motion.div>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <motion.div key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <Link href={item.href} className="relative px-4 py-2 block group">
                    {/* Hover/active pill */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: isActive ? GOLD_SOFT : "transparent" }}
                      whileHover={{ background: GOLD_SOFT }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10 text-[0.85rem] font-medium transition-colors duration-200"
                      style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }}>
                      {item.label}
                    </span>

                    {/* Active gold dot */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-dot"
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      />
                    )}

                    {/* Gold underline on hover */}
                    {!isActive && (
                      <motion.div
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-px rounded-full"
                        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                        initial={{ width: 0 }}
                        whileHover={{ width: "60%" }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* ── CTA + Hamburger ───────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Magnetic CTA */}
            <motion.div
              ref={ctaRef}
              style={{ x: ctaSx, y: ctaSy }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block"
            >
              <Link href="/contact">
                <motion.div
                  className="relative overflow-hidden px-5 py-2.5 rounded-full text-[0.82rem] font-bold text-zinc-950 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 55%, #a07848 100%)` }}
                  whileHover={{ scale: 1.05, boxShadow: `0 8px 24px ${GOLD}35` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />
                  <span className="relative z-10 tracking-wide">Get Started</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Hamburger */}
            <motion.button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] relative z-10"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.92 }}
            >
              <motion.span className="block w-5 h-[1.5px] rounded-full origin-center"
                style={{ background: GOLD }}
                animate={menuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
              <motion.span className="block w-5 h-[1.5px] rounded-full"
                style={{ background: GOLD }}
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }} />
              <motion.span className="block w-5 h-[1.5px] rounded-full origin-center"
                style={{ background: GOLD }}
                animate={menuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile fullscreen menu ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[800] bg-[#050709] flex flex-col md:hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse 80% 50% at 50% 20%, ${GOLD_SOFT}, transparent)` }} />
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>

            {/* Animated gold hairlines */}
            <motion.div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }} />
            <motion.div className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }} />

            {/* Nav links */}
            <div className="flex-1 flex flex-col justify-center px-8 pt-24 pb-12 space-y-1">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div key={item.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={item.href}
                      className="flex items-center justify-between py-4 border-b group"
                      style={{ borderColor: `${GOLD_BORDER}` }}>
                      <div className="flex items-center gap-4">
                        {/* Gold number */}
                        <motion.span className="text-[10px] font-mono tracking-widest"
                          style={{ color: isActive ? GOLD : `${GOLD}30` }}
                          animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}>
                          0{i + 1}
                        </motion.span>
                        <motion.span
                          className="font-black leading-none tracking-[-0.03em] transition-colors duration-200"
                          style={{
                            fontFamily: "'DM Serif Display', Georgia, serif",
                            fontSize: "clamp(2rem, 8vw, 3.5rem)",
                            color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                          }}
                          whileHover={{ color: GOLD }}
                          transition={{ duration: 0.2 }}>
                          {item.label}
                        </motion.span>
                      </div>
                      <motion.span
                        style={{ color: isActive ? GOLD : "rgba(255,255,255,0.2)" }}
                        whileHover={{ x: 4, color: GOLD }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                        ↗
                      </motion.span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile CTA — gold gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="px-8 pb-14">
              <Link href="/contact">
                <motion.div
                  className="relative overflow-hidden w-full py-4 rounded-2xl text-center text-zinc-950 font-bold text-[1rem]"
                  style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}
                  whileTap={{ scale: 0.97 }}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />
                  <span className="relative z-10">Start Your Project →</span>
                </motion.div>
              </Link>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-center text-xs mt-5 font-mono tracking-widest uppercase"
                style={{ color: `${GOLD}50` }}>
                Bengaluru · India
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}