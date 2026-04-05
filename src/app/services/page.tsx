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
} from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faShieldHalved,
  faUsers,
  faLightbulb,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

// ─── Gold design tokens ───────────────────────────────────────────────────────
const GOLD = "#c8a97e";
const GOLD_DIM = "rgba(200,169,126,0.5)";
const GOLD_SOFT = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

// ─── ANIMATION 1: Text scramble hook ─────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
function useScramble(target: string, trigger: boolean, speed = 40) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const total = target.length * 6;
    const interval = setInterval(() => {
      setDisplay(
        target
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration / 6) return target[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iteration++;
      if (iteration > total) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [trigger, target, speed]);
  return display;
}

// ─── ANIMATION 2: Animated counter ───────────────────────────────────────────
function AnimatedCounter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix;
      },
    });
    return controls.stop;
  }, [isInView, to, suffix, prefix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── ANIMATION 3: Magnetic card hook ─────────────────────────────────────────
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }, [x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, springX, springY };
}

// ─── ANIMATION 4: Char-by-char split heading ──────────────────────────────────
function SplitHeading({
  children,
  className,
  style,
  isInView,
  delay = 0,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  isInView: boolean;
  delay?: number;
}) {
  return (
    <h2 className={className} style={style}>
      {children.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.018,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </h2>
  );
}

// ─── ANIMATION 5: Clip-path image reveal ─────────────────────────────────────
function ClipRevealImage({
  src,
  alt,
  isInView,
}: {
  src: string;
  alt: string;
  isInView: boolean;
}) {
  return (
    <motion.div
      className="w-full h-full"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <img src={src} alt={alt} className="w-full h-auto" />
    </motion.div>
  );
}

// ─── ANIMATION 6: Parallax section wrapper ───────────────────────────────────
function ParallaxLayer({
  children,
  speed = 0.15,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// ─── ANIMATION 7: Glowing orbit ring — gold palette ──────────────────────────
function OrbitRing({ color, size, duration, delay }: { color: string; size: number; duration: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        border: `1px solid ${color}30`,
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        boxShadow: `0 0 40px ${color}10, inset 0 0 40px ${color}05`,
      }}
      animate={{ rotate: 360, scale: [1, 1.02, 1] }}
      transition={{ rotate: { duration, repeat: Infinity, ease: "linear", delay }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
    >
      <motion.div
        className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: color, boxShadow: `0 0 10px ${color}, 0 0 20px ${color}60` }}
      />
    </motion.div>
  );
}

// ─── Grain + Spotlight ────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[998] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

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
      {/* Gold spotlight — matches services page */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
        style={{ background: `radial-gradient(circle, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }}
      />
    </motion.div>
  );
}

// ─── Section label — gold hairlines ──────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 mb-5">
      <motion.div
        className="h-[1px]"
        style={{ background: GOLD_DIM }}
        initial={{ width: 0 }}
        whileInView={{ width: 24 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: GOLD, opacity: 0.8 }}
      >
        {children}
      </span>
      <motion.div
        className="h-[1px]"
        style={{ background: GOLD_DIM }}
        initial={{ width: 0 }}
        whileInView={{ width: 24 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const pillars = [
  {
    icon: faRocket,
    title: "Real Products",
    sub: "Built & Used",
    accent: "#00f5ff",
    accentTo: "#67e8f9",
    desc: "We build products that are actually used — like campus ordering systems and AI tools."
  },
  {
    icon: faShieldHalved,
    title: "Practical AI",
    sub: "Not hype",
    accent: "#a855f7",
    accentTo: "#c084fc",
    desc: "Our AI systems focus on real improvements — interview training, document understanding, and automation."
  },
  {
    icon: faUsers,
    title: "Student Driven",
    sub: "Fast & Experimental",
    accent: "#ec4899",
    accentTo: "#f472b6",
    desc: "We experiment, build fast, and iterate — without corporate limitations."
  },
  {
    icon: faLightbulb,
    title: "Problem First",
    sub: "Not just code",
    accent: "#f59e0b",
    accentTo: "#fbbf24",
    desc: "Every project starts with a real problem — not just a cool idea."
  },
];

const differentiators = [
  { label: "Senior engineers only", sub: "No juniors on your project, ever", accent: "#00f5ff" },
  { label: "Async-first process", sub: "No unnecessary meetings or standups", accent: "#a855f7" },
  { label: "Weekly demos", sub: "Full transparency on every sprint", accent: "#ec4899" },
  { label: "Product thinking", sub: "We care about outcomes, not just code", accent: "#f59e0b" },
  { label: "Fixed-scope milestones", sub: "No surprise invoices or scope creep", accent: "#10b981" },
  { label: "Post-launch support", sub: "We don't disappear after delivery", accent: "#38bdf8" },
];

const team = [
  { name: "Sreyash Ranjan", role: "Co-founder & CTO", avatar: "SR", accent: "#00f5ff", bio: "Focused on building scalable systems and turning ideas into working products.", links: { github: "#", linkedin: "#", twitter: "#" } },
  { name: "Shreyes Simha J R", role: "Co-founder & CPO", avatar: "SS", accent: "#a855f7", bio: "Works on product ideas and ensures they solve real user problems.", links: { github: "#", linkedin: "#", twitter: "#" } },
  { name: "Sujan Gowda S", role: "Co-founder & Lead AI Engineer", avatar: "SG", accent: "#ec4899", bio: "Builds AI-based systems like interview training and document understanding tools.", links: { github: "#", linkedin: "#", twitter: "#" } },
  { name: "Preathyush C M", role: "Head of Design", avatar: "PC", accent: "#f59e0b", bio: "Designs clean and usable interfaces that people actually enjoy using.", links: { github: "#", linkedin: "#", twitter: "#" } },
];

const timeline = [
  {
    year: "2025",
    event: "Started building Veltrex.Devs with focus on real-world products.",
    accent: "#00f5ff"
  },
  {
    year: "2025",
    event: "Built SideQuest — campus ordering and printing system.",
    accent: "#a855f7"
  },
  {
    year: "2026",
    event: "Developed Onyx — AI-based interview training platform.",
    accent: "#ec4899"
  },
  {
    year: "2026",
    event: "Created OfficeDocs — LLM-powered document assistant.",
    accent: "#f59e0b"
  }
];

const statsData = [
  { to: 3, suffix: "+", label: "Core Products" },
  { to: 1, suffix: "", label: "Campus System Live" },
  { to: 3, suffix: "+", label: "AI Projects" },
  { to: 100, suffix: "+", label: "Users Testing" },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [scrambled, setScrambled] = useState(false);
  const headline = useScramble("real products.", scrambled, 35);

  useEffect(() => {
    const t = setTimeout(() => setScrambled(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050709] pt-20">
      {/* Atmospheric bg */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold top accent line — animated scale-in */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0, originX: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,245,255,0.04),transparent)]" />
        {/* Warm gold ambient glow */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        />
      </div>

      {/* Orbit rings — gold palette */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-[8%]">
        <div className="relative w-[500px] h-[500px] hidden xl:block">
          <OrbitRing color={GOLD} size={460} duration={22} />
          <OrbitRing color="#e8c89a" size={340} duration={15} delay={3} />
          <OrbitRing color="#a07848" size={220} duration={9} delay={6} />
          {/* Glowing core */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
            style={{ background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)` }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[700px]">

          {/* Badge — gold shimmer, matches services page */}
          <motion.div variants={fadeUp} className="mb-7">
            <motion.span
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase relative overflow-hidden"
              style={{
                border: `1px solid ${GOLD_BORDER}`,
                background: GOLD_SOFT,
                color: GOLD,
              }}
              whileHover={{ borderColor: `${GOLD}50` }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(200,169,126,0.12), rgba(0,0,0,0))` }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
              />
              About Veltrex.Devs · Est. 2025 · Bengaluru
            </motion.span>
          </motion.div>

          {/* Headline — scramble line with gold gradient */}
          <motion.div variants={fadeUp} className="mb-3">
            <h1
              className="font-black leading-[0.92] tracking-[-0.035em] text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3.2rem, 7.5vw, 6.2rem)" }}
            >
              We build what
              <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: scrambled ? "'DM Serif Display', Georgia, serif" : "monospace",
                }}
              >
                {headline}
              </span>
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[1.15rem] text-gray-500 max-w-[520px] leading-[1.8] font-light mb-10">
            We build real-world products — from campus tools to AI platforms — designed to solve actual problems, not just look good.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            {/* Primary — gold gradient button */}
            <motion.a
              href="/contact"
              whileHover={{ y: -4, boxShadow: `0 20px 40px ${GOLD}25` }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2.5 font-bold text-[0.9rem] px-8 py-4 rounded-full shadow-2xl min-w-[220px] justify-center relative overflow-hidden text-[#0e0d0c]"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0))" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
              />
              <span className="relative z-10">Start Your Project →</span>
            </motion.a>

            {/* Ghost — gold hover */}
            <motion.a
              href="/projects"
              whileHover={{ y: -4, borderColor: GOLD_BORDER, color: GOLD }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2.5 text-gray-500 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1] transition-colors duration-200"
            >
              View Our Work
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — gold */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: `1px solid ${GOLD_BORDER}` }}
        >
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
      {/* Gold hairlines */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4"
      >
        {statsData.map(({ to, suffix, label }, i) => (
          <motion.div
            key={label}
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center py-4 relative cursor-default group"
          >
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-10" style={{ background: GOLD_BORDER }} />
            )}
            {/* Gold gradient number */}
            <div
              className="text-[3.2rem] font-black leading-none mb-2.5 tabular-nums"
              style={{
                background: `linear-gradient(160deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}
            >
              <AnimatedCounter to={to} suffix={suffix} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "rgba(200,169,126,0.4)" }}>
              {label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── WHO WE ARE — clip-path reveal + parallax image ──────────────────────────
function WhoWeAre() {
  const { ref, isInView } = useFadeIn();

  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 40% at 75% 50%, ${GOLD_SOFT}, rgba(0,0,0,0))` }} />

      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_440px] gap-20 items-center">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>Who We Are</SectionLabel></motion.div>

          <SplitHeading
            isInView={isInView}
            delay={0.1}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            {"A studio that cares"}
          </SplitHeading>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-500 text-lg leading-relaxed mb-6 max-w-[500px]"
          >
            Veltrex.Devs is a student-built product studio focused on solving real problems through technology — from campus systems to AI-driven platforms.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-700 text-base leading-relaxed max-w-[500px]"
          >
            We don’t just build projects — we build usable systems that people actually interact with daily.
          </motion.p>
        </motion.div>

        {/* Image with clip-path reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            <ClipRevealImage
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80"
              alt="Veltrex.Devs team"
              isInView={isInView}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050709]/70 via-transparent to-transparent" />
          </div>

          {/* Floating metric cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="text-[10px] text-gray-600 mb-1 uppercase tracking-widest">Founded</div>
              <div className="text-[2rem] font-black text-white leading-none">2025</div>
              <div className="text-[10px] mt-1" style={{ color: GOLD }}>Bengaluru, India</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.3 }}
          >
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, delay: 1.2, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="text-[13px] text-gray-300 font-medium">Actively taking projects</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PILLARS — magnetic cards ─────────────────────────────────────────────────
function MagneticPillarCard({ p, i, isInView }: { p: typeof pillars[0]; i: number; isInView: boolean }) {
  const { ref, springX, springY } = useMagnetic(0.18);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      variants={fadeScale}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group cursor-pointer"
    >
      {/* Glow border */}
      <motion.div
        className="absolute -inset-[1px] rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${p.accent}50, ${p.accentTo}20)` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${p.accent}08, transparent)` }}
      />

      <div className="relative bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-9 h-full flex gap-7 transition-colors duration-400">
        <motion.div
          className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${p.accent}12`, border: `1px solid ${p.accent}30` }}
          animate={{ rotate: hovered ? 8 : 0, scale: hovered ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <FontAwesomeIcon icon={p.icon} style={{ color: p.accent, fontSize: "1.3rem" }} />
        </motion.div>

        <div>
          <div
            className="text-[1.1rem] font-bold text-white mb-1 leading-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {p.title}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: p.accent, opacity: 0.7 }}>
            {p.sub}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PillarsSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 20% 60%, ${GOLD_SOFT}, rgba(0,0,0,0))` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mb-20">
          <motion.div variants={fadeUp}><SectionLabel>Why Us</SectionLabel></motion.div>
          <SplitHeading
            isInView={isInView}
            delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white max-w-[560px]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            {"Built on four non-negotiables."}
          </SplitHeading>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-5"
        >
          {pillars.map((p, i) => (
            <MagneticPillarCard key={p.title} p={p} i={i} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── DIFFERENTIATORS — staggered slide-in rows ───────────────────────────────
function DifferentiatorsSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_40%_at_75%_50%,rgba(168,85,247,0.03),transparent)]" />
      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_480px] gap-20 items-start">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>What Makes Us Different</SectionLabel></motion.div>
          <SplitHeading
            isInView={isInView}
            delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            {"We operate like a product team."}
          </SplitHeading>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed max-w-[400px]">
            Most studios take briefs and deliver code. We take ownership and deliver outcomes.
          </motion.p>
        </motion.div>

        <div className="space-y-3 pt-2">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 6 }}
              className="flex items-center gap-5 bg-[#0a0c12] border border-white/[0.06] rounded-2xl px-6 py-5 hover:border-white/10 transition-colors duration-300 group cursor-pointer"
            >
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border"
                style={{ background: `${d.accent}12`, borderColor: `${d.accent}30`, color: d.accent }}
                whileHover={{ scale: 1.2, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                ✓
              </motion.div>
              <div>
                <div className="text-white text-sm font-semibold">{d.label}</div>
                <div className="text-gray-700 text-xs mt-0.5">{d.sub}</div>
              </div>
              <motion.div
                className="ml-auto"
                animate={{ x: 0, opacity: 0.3 }}
                whileHover={{ x: 4, opacity: 1 }}
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 text-xs" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TIMELINE — gold SVG path draw ───────────────────────────────────────────
function TimelineSection() {
  const { ref, isInView } = useFadeIn();

  return (
    <section ref={ref} className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 15% 60%, ${GOLD_SOFT}, rgba(0,0,0,0))` }} />

      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mb-20">
          <motion.div variants={fadeUp}><SectionLabel>Our Story</SectionLabel></motion.div>
          <SplitHeading
            isInView={isInView}
            delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            {"Five years of shipping."}
          </SplitHeading>
        </motion.div>

        <div className="relative">
          {/* Gold SVG vertical timeline line */}
          <svg className="absolute left-[26px] md:left-1/2 top-0 h-full w-px overflow-visible" style={{ transform: "translateX(-50%)" }}>
            <motion.line
              x1="0" y1="0" x2="0" y2="100%"
              stroke="url(#timelineGrad)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
            <defs>
              <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0.6" />
                <stop offset="50%" stopColor="#e8c89a" stopOpacity="0.3" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Dot */}
                <motion.div
                  className="absolute left-0 md:left-1/2 top-1.5 w-[52px] h-[52px] -translate-x-0 md:-translate-x-1/2 rounded-full border flex items-center justify-center flex-shrink-0 z-10 bg-[#0a0c12]"
                  style={{ borderColor: `${item.accent}40` }}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.5 + i * 0.12 }}
                  whileHover={{ scale: 1.2, borderColor: item.accent }}
                >
                  <span className="text-[10px] font-black font-mono" style={{ color: item.accent }}>
                    {item.year.slice(2)}
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: item.accent }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  />
                </motion.div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.12)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`ml-16 md:ml-0 bg-[#0a0c12] border border-white/[0.06] rounded-2xl px-7 py-6 md:w-[44%] transition-colors duration-300 ${
                    i % 2 === 0 ? "md:mr-auto md:ml-0 md:pr-12" : "md:ml-auto md:pl-12"
                  }`}
                >
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: item.accent, opacity: 0.8 }}
                  >
                    {item.year}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.event}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TEAM — cards with tilt + border glow ────────────────────────────────────
function TeamCard({ member }: { member: typeof team[0] }) {
  const { ref, springX, springY } = useMagnetic(0.12);
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRY = useSpring(rotateY, { stiffness: 150, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateX.set(((e.clientY - cy) / rect.height) * -12);
    rotateY.set(((e.clientX - cx) / rect.width) * 12);
  };

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} variants={fadeScale}>
      <motion.div
        ref={cardRef}
        style={{ rotateX: springRX, rotateY: springRY, transformStyle: "preserve-3d", perspective: "800px" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); rotateX.set(0); rotateY.set(0); }}
        className="relative group cursor-pointer h-full"
      >
        <motion.div
          className="absolute -inset-[1px] rounded-3xl"
          style={{ background: `linear-gradient(135deg, ${member.accent}45, transparent)` }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-8 flex flex-col h-full" style={{ transform: "translateZ(0)" }}>
          <div className="relative mb-6 w-14 h-14">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: member.accent, filter: "blur(12px)" }}
              animate={{ opacity: hovered ? 0.3 : 0.1, scale: hovered ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
            />
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: `${member.accent}18`, border: `1px solid ${member.accent}35`, color: member.accent }}
            >
              {member.avatar}
            </div>
          </div>

          <div className="flex-1">
            <div className="text-white font-bold text-[1.05rem] mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {member.name}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-4" style={{ color: member.accent, opacity: 0.7 }}>
              {member.role}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
          </div>

          <div className="flex gap-2.5 mt-6 pt-5 border-t border-white/[0.05]">
            {[{ icon: faGithub, href: member.links.github }, { icon: faLinkedin, href: member.links.linkedin }, { icon: faTwitter, href: member.links.twitter }].map(({ icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                whileHover={{ y: -3, color: "#ffffff", borderColor: "rgba(255,255,255,0.25)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-8 h-8 rounded-lg border border-white/[0.07] flex items-center justify-center text-gray-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={icon} className="text-xs" />
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TeamSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GOLD_SOFT}, rgba(0,0,0,0))` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-20">
          <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>The Team</SectionLabel></motion.div>
          <SplitHeading
            isInView={isInView}
            delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mx-auto"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", display: "block" }}
          >
            {"Builders focused on real-world impact."}
          </SplitHeading>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-5"
        >
          {team.map((member) => <TeamCard key={member.name} member={member} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA — gold gradient headline + shimmer button ────────────────────────────
function CTASection() {
  const { ref, isInView } = useFadeIn();

  return (
    <section ref={ref} className="py-40 bg-[#050709] relative overflow-hidden">
      <ParallaxLayer speed={-0.12} className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }}
        />
      </ParallaxLayer>

      {/* Gold hairlines */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 text-center relative z-10"
      >
        <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>Work With Us</SectionLabel></motion.div>

        <SplitHeading
          isInView={isInView}
          delay={0.05}
          className="font-black leading-[0.92] tracking-[-0.035em] text-white mb-2 mx-auto block"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", maxWidth: "880px" }}
        >
          {"Let's build something"}
        </SplitHeading>

        {/* "extraordinary." — gold gradient, matches services page */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.55 }}
          className="mb-14"
        >
          <span
            className="font-black leading-none tracking-[-0.035em] block italic"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(3rem,8vw,6.5rem)",
              background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            extraordinary.
          </span>
        </motion.div>

        <motion.p variants={fadeUp} className="text-gray-600 text-xl mb-14 max-w-sm mx-auto leading-relaxed">
          Startup idea or enterprise partnership — we move fast and build right.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          {/* Primary — gold gradient button */}
          <motion.a
            href="/contact"
            whileHover={{ y: -4, boxShadow: `0 20px 40px ${GOLD}25` }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 font-bold text-[0.9rem] px-8 py-4 rounded-full shadow-2xl min-w-[220px] justify-center relative overflow-hidden text-[#0e0d0c]"
            style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0))" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
            />
            <span className="relative z-10">Start Your Project →</span>
          </motion.a>

          {/* Ghost — gold hover */}
          <motion.a
            href="/services"
            whileHover={{ y: -4, borderColor: GOLD_BORDER, color: GOLD }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 text-gray-500 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1] min-w-[200px] justify-center transition-colors duration-200"
          >
            View Services
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <main className="bg-[#050709] text-white">
      <GrainOverlay />
      <SpotlightCursor />
      <Hero />
      <StatsStrip />
      <WhoWeAre />
      <PillarsSection />
      <DifferentiatorsSection />
      <TimelineSection />
      <TeamSection />
      <CTASection />
    </main>
  );
}