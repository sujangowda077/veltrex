"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  animate,
  Variants,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

// ─── Gold design tokens ───────────────────────────────────────────────────────
const GOLD        = "#c8a97e";
const GOLD_DIM    = "rgba(200,169,126,0.5)";
const GOLD_SOFT   = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

// ─── Motion variants ──────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

// ─── Text scramble ────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
function useScramble(target: string, trigger: boolean, speed = 35) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const total = target.length * 6;
    const interval = setInterval(() => {
      setDisplay(target.split("").map((char, i) => {
        if (char === " ") return " ";
        if (i < iteration / 6) return target[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(""));
      iteration++;
      if (iteration > total) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [trigger, target, speed]);
  return display;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2.2, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix; },
    });
    return controls.stop;
  }, [isInView, to, suffix, prefix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── Magnetic hook ────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: globalThis.MouseEvent) => {
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => { el.removeEventListener("mousemove", handleMove); el.removeEventListener("mouseleave", handleLeave); };
  }, [x, y, strength]);
  return { ref, springX, springY };
}

// ─── Char-split heading ───────────────────────────────────────────────────────
function SplitHeading({
  children, className, style, isInView, delay = 0, tag = "h2",
}: {
  children: string; className?: string; style?: React.CSSProperties;
  isInView: boolean; delay?: number; tag?: "h1" | "h2";
}) {
  const Tag = tag as any;
  return (
    <Tag className={className} style={style}>
      {children.split("").map((char, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.018, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}>
          {char}
        </motion.span>
      ))}
    </Tag>
  );
}

// ─── Clip-reveal image ────────────────────────────────────────────────────────
function ClipRevealImage({ src, alt, isInView, delay = 0.2 }: { src: string; alt: string; isInView: boolean; delay?: number }) {
  return (
    <motion.div className="w-full h-full"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}>
      {src ? (
  <img src={src} alt={alt} className="w-full h-full object-cover" />
) : (
  <div
    className="w-full h-full flex items-center justify-center backdrop-blur-md"
    style={{
      background: "rgba(200,169,126,0.06)",
      border: "1px solid rgba(200,169,126,0.15)",
    }}
  >
    <div className="text-center">
      <div
        style={{
          color: "#c8a97e",
          fontSize: "12px",
          letterSpacing: "0.25em",
        }}
      >
        IN DEVELOPMENT
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "11px",
          marginTop: "6px",
        }}
      >
        Coming soon
      </div>
    </div>
  </div>
)}
    </motion.div>
  );
}

// ─── Parallax layer ───────────────────────────────────────────────────────────
function ParallaxLayer({ children, speed = 0.15, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// ─── Orbit ring — gold palette ────────────────────────────────────────────────
function OrbitRing({ color, size, duration, delay = 0 }: { color: string; size: number; duration: number; delay?: number }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        border: `1px solid ${color}30`,
        top: "50%", left: "50%", x: "-50%", y: "-50%",
        boxShadow: `0 0 40px ${color}10, inset 0 0 40px ${color}05`,
      }}
      animate={{ rotate: 360, scale: [1, 1.02, 1] }}
      transition={{ rotate: { duration, repeat: Infinity, ease: "linear", delay }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
      <motion.div className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: color, boxShadow: `0 0 10px ${color}, 0 0 20px ${color}60` }} />
    </motion.div>
  );
}

// ─── Spotlight cursor ─────────────────────────────────────────────────────────
function SpotlightCursor() {
  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);
  const springX = useSpring(cursorX, { stiffness: 80, damping: 22 });
  const springY = useSpring(cursorY, { stiffness: 80, damping: 22 });
  useEffect(() => {
    const move = (e: globalThis.MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [cursorX, cursorY]);
  return (
    <motion.div className="pointer-events-none fixed inset-0 z-[999] hidden lg:block" style={{ x: springX, y: springY }}>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
        style={{ background: `radial-gradient(circle, ${GOLD_SOFT} 0%, transparent 70%)` }} />
    </motion.div>
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[998] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />
  );
}

// ─── Section label — gold hairlines ──────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 mb-5">
      <motion.div className="h-[1px]" style={{ background: GOLD_DIM }}
        initial={{ width: 0 }} whileInView={{ width: 24 }} viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: GOLD, opacity: 0.8 }}>{children}</span>
      <motion.div className="h-[1px]" style={{ background: GOLD_DIM }}
        initial={{ width: 0 }} whileInView={{ width: 24 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
type Project = {
  title: string; cat: string; year: string; desc: string; img: string;
  stack: string[]; outcome: string; accent: string; accentTo: string;
  link?: string;
};

const projects: Project[] = [
  { title: "Office Docs",  cat: "SaaS",        year: "2026", desc: "An LLM-based system that reads PDFs and answers user questions instantly, making document understanding faster and easier.", img: "/assets/project/officdocs.png",  stack: ["React Native", "Node.js", "ML", "Redis"],          outcome: "Instant PDF Q&A experience", accent: GOLD,     accentTo: "#e8c89a" },
  { title: "Onyx",    cat: "AI-Tech",     year: "2026", desc: "An AI-based interview training platform that helps users improve communication, confidence, and problem-solving through real-time feedback.", img: "/assets/project/onyx.png", stack: ["Next.js", "Python", "OpenAI"],                      outcome: "Improves interview confidence",      accent: "#e8c89a", accentTo: GOLD },
  { title: "SideQuest",   cat: "SaaS",         year: "2025", desc: "A campus app for food ordering, printing, and student services, with earning opportunities through delivery tasks.", img: "/assets/project/sidequest.png", stack: ["React", "Node.js"],                   outcome: "Simplifies campus life", accent: "#a07848", accentTo: GOLD, link: "https://side-quest-app-sand.vercel.app" },
  {
  title: "Timetable Planner",
  cat: "Productivity",
  year: "2026",
  desc: "A smart timetable planning tool designed to help students organize schedules efficiently. Currently under development.",
  img: "",
  stack: ["Next.js", "TypeScript"],
  outcome: "In development",
  accent: "#c8a97e",
  accentTo: "#e8c89a"
}
 
];

const allCats = ["All", ...Array.from(new Set(projects.map((p) => p.cat)))];

const statsData = [
  { to: 3, suffix: "+", label: "Projects Built" },
  { to: 4, suffix: "", label: "Core Team" },
  { to: 3, suffix: "", label: "Active Products" },
  { to: 100, suffix: "+", label: "Users Reached" },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [scrambled, setScrambled] = useState(false);
  const scrambledWord = useScramble("shipped", scrambled, 32);
  useEffect(() => { const t = setTimeout(() => setScrambled(true), 600); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-[62vh] flex flex-col justify-end pb-24 pt-36 overflow-hidden bg-[#050709]">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0, originX: "left" }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${GOLD_SOFT}, transparent)` }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />
      </div>

      {/* Orbit rings — gold palette */}
      <div className="absolute right-[4%] top-1/2 -translate-y-1/2 w-[420px] h-[420px] pointer-events-none hidden xl:block">
        <OrbitRing color={GOLD}    size={380} duration={20} />
        <OrbitRing color="#e8c89a" size={270} duration={14} delay={3} />
        <OrbitRing color="#a07848" size={160} duration={8}  delay={5} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)` }} />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Badge — gold shimmer */}
          <motion.div variants={fadeUp} className="mb-7">
            <motion.span
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase relative overflow-hidden"
              style={{ border: `1px solid ${GOLD_BORDER}`, background: GOLD_SOFT, color: GOLD }}
              whileHover={{ borderColor: `${GOLD}50` }}>
              <motion.div className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(200,169,126,0.12), rgba(0,0,0,0))` }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
              Selected Work · {projects.length} Case Studies
            </motion.span>
          </motion.div>

          {/* Headline — gold 3-stop gradient on scramble word */}
          <motion.div variants={fadeUp}>
            <h1 className="font-black leading-[0.92] tracking-[-0.035em] text-white mb-8"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3.2rem, 7.5vw, 6.2rem)" }}>
              Products we've
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 55%, #a07848 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontFamily: scrambled ? "'DM Serif Display', Georgia, serif" : "monospace",
              }}>
                {scrambledWord}
              </span>{" "}
              <span className="text-gray-600">& scaled.</span>
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[1.15rem] text-gray-500 max-w-[500px] leading-[1.8] font-light">
            Real products built by students — solving everyday problems with AI, web, and mobile apps.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator — gold */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: `1px solid ${GOLD_BORDER}` }}>
          <div className="w-0.5 h-2 rounded-full" style={{ background: GOLD_DIM }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── STATS — gold gradient numbers ───────────────────────────────────────────
function StatsStrip() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="relative bg-[#050709]">
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4">
        {statsData.map(({ to, suffix, label }, i) => (
          <motion.div key={label} variants={fadeUp}
            whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center py-4 relative cursor-default">
            {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-10" style={{ background: GOLD_BORDER }} />}
            <div className="text-[3.2rem] font-black leading-none mb-2.5 tabular-nums"
              style={{
                background: `linear-gradient(160deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}>
              <AnimatedCounter to={to} suffix={suffix} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: `${GOLD}60` }}>{label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── FEATURED STRIP ───────────────────────────────────────────────────────────
function FeaturedStrip() {
  const { ref, isInView } = useFadeIn();
  const featured = projects.slice(0, 3);
  return (
    <section ref={ref} className="py-28 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 40% at 15% 60%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="flex items-end justify-between mb-16 flex-wrap gap-6">
          <div>
            <motion.div variants={fadeUp}><SectionLabel>Highlights</SectionLabel></motion.div>
            <SplitHeading isInView={isInView} delay={0.05}
              className="font-black leading-[1.05] tracking-[-0.028em] text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
              {"Three of our best."}
            </SplitHeading>
          </div>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 gap-4">
          <motion.div variants={fadeScale} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] h-[420px]">
              <ClipRevealImage src={featured[0].img} alt={featured[0].title} isInView={isInView} delay={0.2} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-[#050709]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-[11px] font-bold mb-3 uppercase tracking-[0.18em]" style={{ color: featured[0].accent }}>
                  {featured[0].cat} · {featured[0].year}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {featured[0].title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-[380px]">{featured[0].desc}</p>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: featured[0].accent }}>
                  <span>Case Study</span><FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </div>
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col gap-4">
            {[featured[1], featured[2]].map((proj, idx) => (
              <motion.div key={proj.title} variants={fadeScale} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="group cursor-pointer flex-1">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] h-[200px]">
                  <ClipRevealImage src={proj.img} alt={proj.title} isInView={isInView} delay={0.35 + idx * 0.15} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-[#050709]/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-[10px] font-bold mb-1.5 uppercase tracking-[0.18em]" style={{ color: proj.accent }}>
                      {proj.cat} · {proj.year}
                    </div>
                    <h3 className="text-[1.05rem] font-bold text-white mb-0.5" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      {proj.title}
                    </h3>
                    <p className="text-gray-600 text-xs">{proj.outcome}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PROJECT ROW ──────────────────────────────────────────────────────────────
function ProjectRow({ project: p, index: i }: { project: Project; index: number }) {
  const { ref: magRef, springX, springY } = useMagnetic(0.06);
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, amount: 0.3 });

  return (
    <motion.div ref={rowRef}
      initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{ borderBottom: `1px solid ${GOLD_BORDER}20` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.35 }}
        style={{ background: `radial-gradient(ellipse 60% 100% at 30% 50%, ${p.accent}08, transparent)` }} />
      <motion.a
  ref={magRef as any}
  href={p.link && p.link.trim() ? p.link.trim() : undefined}
  target="_blank"
  rel="noopener noreferrer"
  className="relative cursor-pointer py-9 grid gap-6 md:gap-10 items-start"
  style={{
    x: springX,
    y: springY,
    gridTemplateColumns: "52px 1fr 160px 190px",
  }}
>
        <div className="pt-1 relative">
          <span className="font-mono text-[0.65rem] tracking-widest" style={{ color: `${GOLD}30` }}>
            0{i + 1}
          </span>
          <motion.div className="absolute -left-3 top-2.5 w-1 h-1 rounded-full" style={{ background: GOLD }}
            animate={{ scale: hovered ? [1, 1.8, 1] : 1, opacity: hovered ? [0.5, 1, 0.5] : 0 }}
            transition={{ duration: 1.2, repeat: hovered ? Infinity : 0 }} />
        </div>
        <div>
          <motion.h3 className="font-black leading-tight tracking-[-0.02em] mb-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.65rem" }}
            animate={{ color: hovered ? GOLD : "#e8e4de" }} transition={{ duration: 0.3 }}>
            {p.title}
          </motion.h3>
          <p className="text-[0.88rem] leading-[1.85] mb-5 max-w-[420px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {p.desc}
          </p>
          <div className="flex flex-wrap gap-3">
            {p.stack.map((t, idx) => (
              <motion.span key={t}
                initial={{ opacity: 0, y: 8 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.06 + idx * 0.04, duration: 0.5 }}
                className="text-[10px] uppercase tracking-[0.15em] font-mono"
                style={{ color: `${GOLD}40` }}>
                {t}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="pt-1">
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: GOLD, opacity: 0.8 }}>{p.cat}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-mono" style={{ color: `${GOLD}40` }}>{p.year}</div>
        </div>
        <div className="flex items-start justify-between pt-1">
          <div>
            <div className="text-[0.75rem] mb-1 font-mono" style={{ color: GOLD, opacity: 0.6 }}>↳</div>
            <span className="text-[0.82rem] italic leading-snug"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {p.outcome}
            </span>
          </div>
          <motion.div animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8, rotate: hovered ? 0 : -15 }}
            transition={{ duration: 0.25 }}>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ color: GOLD, fontSize: "0.75rem" }} />
          </motion.div>
        </div>
      </motion.a>
    </motion.div>
  );  
}

// ─── PROJECT LIST ─────────────────────────────────────────────────────────────
function ProjectList() {
  const { ref, isInView } = useFadeIn(0.05);
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.cat === active);

  return (
    <section ref={ref} className="py-28 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 55% 40% at 75% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mb-14">
          <motion.div variants={fadeUp}><SectionLabel>All Projects</SectionLabel></motion.div>
          <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <SplitHeading isInView={isInView} delay={0.04}
              className="font-black leading-[1.05] tracking-[-0.028em] text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              {`${filtered.length} case${filtered.length !== 1 ? "s" : ""} in the portfolio.`}
            </SplitHeading>
          </motion.div>

          {/* Filter bar — gold selected state */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {allCats.map((cat) => {
              const isActive = active === cat;
              return (
                <motion.button key={cat} onClick={() => setActive(cat)}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] relative overflow-hidden transition-all duration-200"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` : "transparent",
                    color: isActive ? "#0e0d0c" : `${GOLD}60`,
                    border: isActive ? "none" : `1px solid ${GOLD_BORDER}`,
                  }}>
                  {isActive && (
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div className="h-px mb-0"
          initial={{ scaleX: 0, originX: "left" }} animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `${GOLD}20` }} />

        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            {filtered.length > 0
              ? filtered.map((p, i) => <ProjectRow key={p.title} project={p} index={i} />)
              : (
                <div className="py-20 text-center text-[10px] uppercase tracking-[0.2em] font-mono"
                  style={{ color: `${GOLD}30` }}>
                  No projects in this category yet
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTAStrip() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-40 bg-[#06080d] relative overflow-hidden">
      <ParallaxLayer speed={-0.12} className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${GOLD_SOFT} 0%, rgba(200,169,126,0.04) 40%, transparent 70%)` }} />
      </ParallaxLayer>
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />

      <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 text-center relative z-10">
        <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>Next Step</SectionLabel></motion.div>
        <SplitHeading isInView={isInView} delay={0.04}
          className="font-black leading-[0.92] tracking-[-0.035em] text-white mb-4 mx-auto block"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", maxWidth: "880px" }}>
          {"Your product"}
        </SplitHeading>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.4 }} className="mb-14">
          <span className="font-black leading-none tracking-[-0.035em] block"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 8vw, 6.5rem)" }}>
            could be{" "}
            <span style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              next.
            </span>
          </span>
        </motion.div>
        <motion.p variants={fadeUp} className="text-gray-600 text-xl mb-14 max-w-sm mx-auto leading-relaxed">
          Have an idea? Let’s build something real together.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          <motion.a href="/contact"
            whileHover={{ y: -4, boxShadow: `0 24px 48px ${GOLD}25` }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 font-bold text-[0.9rem] px-8 py-4 rounded-full shadow-2xl min-w-[220px] justify-center relative overflow-hidden text-[#0e0d0c]"
            style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}>
            <motion.div className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
            <span className="relative z-10">Start Your Project →</span>
          </motion.a>
          <motion.a href="mailto:team@veltrex.co.in"
            whileHover={{ y: -4, borderColor: GOLD_BORDER, color: GOLD }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 text-gray-500 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1] min-w-[220px] justify-center">
            team@veltrex.co.in
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Projects() {
  return (
    <main className="bg-[#050709] text-white">
      <GrainOverlay />
      <SpotlightCursor />
      <Hero />
      <StatsStrip />
      <FeaturedStrip />
      <ProjectList />
      <CTAStrip />
    </main>
  );
}