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
  faRocket, faShieldHalved, faUsers, faLightbulb, faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";

// ─── Gold design tokens ───────────────────────────────────────────────────────
const GOLD        = "#c8a97e";
const GOLD_DIM    = "rgba(200,169,126,0.5)";
const GOLD_SOFT   = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

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

// ─── Text scramble ────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
function useScramble(target: string, trigger: boolean, speed = 40) {
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
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [x, y, strength]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => { el.removeEventListener("mousemove", handleMouseMove); el.removeEventListener("mouseleave", handleMouseLeave); };
  }, [handleMouseMove, handleMouseLeave]);
  return { ref, springX, springY };
}

// ─── Char-split heading ───────────────────────────────────────────────────────
function SplitHeading({ children, className, style, isInView, delay = 0 }: {
  children: string; className?: string; style?: React.CSSProperties; isInView: boolean; delay?: number;
}) {
  return (
    <h2 className={className} style={style}>
      {children.split("").map((char, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.018, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}>
          {char}
        </motion.span>
      ))}
    </h2>
  );
}

// ─── Clip-reveal image ────────────────────────────────────────────────────────
function ClipRevealImage({ src, alt, isInView }: { src: string; alt: string; isInView: boolean }) {
  return (
    <motion.div className="w-full h-full"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}>
      <img src={src} alt={alt} className="w-full h-auto" />
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
function OrbitRing({ color, size, duration, delay }: { color: string; size: number; duration: number; delay?: number }) {
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

function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[998] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />
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
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
        style={{ background: `radial-gradient(circle, ${GOLD_SOFT} 0%, transparent 70%)` }} />
    </motion.div>
  );
}

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

// ─── DATA — all gold, no rainbow ──────────────────────────────────────────────
import { faBrain, faFileLines, faCalendar, faUtensils } from "@fortawesome/free-solid-svg-icons";

const pillars = [
  {
    title: "Sidequest",
    sub: "Campus Utility App",
    desc: "App for ordering food within campus and accessing printout services.",
    icon: faUtensils
  },
  {
    title: "Onyx",
    sub: "AI Interview Trainer",
    desc: "AI-based interview training system that improves communication and speaking skills.",
    icon: faBrain
  },
  {
    title: "Office Docs",
    sub: "LLM PDF Assistant",
    desc: "Reads PDFs and answers user questions intelligently using LLM.",
    icon: faFileLines
  },
  {
    title: "Timetable Planner",
    sub: "In Development",
    desc: "A smart timetable planning system currently being built.",
    icon: faCalendar
  }
];

const differentiators = [
  { label: "Senior engineers only",   sub: "No juniors on your project, ever"    },
  { label: "Async-first process",     sub: "No unnecessary meetings or standups"  },
  { label: "Weekly demos",            sub: "Full transparency on every sprint"     },
  { label: "Product thinking",        sub: "We care about outcomes, not just code" },
  { label: "Fixed-scope milestones",  sub: "No surprise invoices or scope creep"  },
  { label: "Post-launch support",     sub: "We don't disappear after delivery"     },
];

const team = [
  {
    name: "Sreyash Ranjan",
    role: "Co-founder",
    image: "/assets/team/ranjan.jpg",
    bio: "Focused on building scalable applications and turning ideas into real-world products.",
    links: { github: "#", linkedin: "#", twitter: "#" }
  },
  {
    name: "Shreyas Simha J R",
    role: "Co-founder",
    image: "/assets/team/simha.jpg",
    bio: "Works on development and system design, bringing concepts to life through code.",
    links: { github: "#", linkedin: "#", twitter: "#" }
  },
  {
    name: "Sujan Gowda S",
    role: "Co-founder",
    image: "/assets/team/sujan.jpg",
    bio: "Interested in AI systems and product development, building smart and useful solutions.",
    links: { github: "#", linkedin: "#", twitter: "#" }
  },
  {
    name: "Prathyush C M",
    role: "Co-founder",
    image: "/assets/team/prathyush.jpg",
    bio: "Focused on UI/UX and design, creating clean and user-friendly experiences.",
    links: { github: "#", linkedin: "#", twitter: "#" }
  }
];

// Gold stop cycling for timeline & team
const GOLD_STOPS = [GOLD, "#e8c89a", "#a07848", GOLD, "#e8c89a", "#a07848"];

const timeline = [
  { year: "2025", event: "Veltrex.Devs was founded by four co-founders with a vision to build impactful digital products." },
  { year: "2026", event: "Developed Office Docs — an LLM-based system to read PDFs and answer user queries." },
  { year: "2026", event: "Expanded into building apps, websites, web apps, and SaaS products." },
  { year: "2026", event: "Growing as a product-focused startup with real-world solutions." },
  { year: "2026", event: "Started building Onyx — an AI-based interview training system to improve communication skills." },
  { year: "2026", event: "Started working on Timetable Planner — currently under development." },
];

const statsData = [
  { to: 2025, suffix: "", label: "Founded" },
  { to: 3,  suffix: "+", label: "Projects Shipped" },
  { to: 4,   suffix: "+", label: "Active Teams" },
  { to: 100,    suffix: "+", label: "End Users" },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [scrambled, setScrambled] = useState(false);
  const headline = useScramble("actually lasts.", scrambled, 35);
  useEffect(() => { const t = setTimeout(() => setScrambled(true), 600); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050709] pt-20">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0, originX: "left" }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${GOLD_SOFT}, transparent)` }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }} />
        <motion.div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      </div>

      {/* Orbit rings — gold palette */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-[8%]">
        <div className="relative w-[500px] h-[500px] hidden xl:block">
          <OrbitRing color={GOLD}    size={460} duration={20} />
          <OrbitRing color="#e8c89a" size={340} duration={14} delay={2} />
          <OrbitRing color="#a07848" size={220} duration={9}  delay={4} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
            style={{ background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)` }} />
        </div>
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[700px]">
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
              Veltrex.Devs · App & AI Studio · Bengaluru
            </motion.span>
          </motion.div>

          {/* Headline — gold gradient scramble */}
          <motion.div variants={fadeUp} className="mb-3">
            <h1 className="font-black leading-[0.92] tracking-[-0.035em] text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3.2rem, 7.5vw, 6.2rem)" }}>
              We build what
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontFamily: scrambled ? "'DM Serif Display', Georgia, serif" : "monospace",
              }}>
                {headline}
              </span>
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[1.15rem] text-gray-500 max-w-[520px] leading-[1.8] font-light mb-10">
            We build apps, websites, web apps, and SaaS products — focused on performance, scalability, and real-world impact.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            {/* Primary — gold gradient button */}
            <motion.a href="/contact"
              whileHover={{ y: -4, boxShadow: `0 20px 40px ${GOLD}25` }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2.5 font-bold text-[0.9rem] px-8 py-4 rounded-full shadow-2xl text-[#0e0d0c] relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}>
              <motion.div className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
              <span className="relative z-10">Start Your Project →</span>
            </motion.a>
            {/* Ghost */}
            <motion.a href="/projects"
              whileHover={{ y: -3, borderColor: GOLD_BORDER, color: GOLD }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2.5 text-gray-500 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1]">
              View Our Work <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — gold */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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

// ─── WHO WE ARE ───────────────────────────────────────────────────────────────
function WhoWeAre() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 55% 40% at 75% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_440px] gap-20 items-center">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>Who We Are</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.1}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
            {"A studio that cares"}
          </SplitHeading>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-500 text-lg leading-relaxed mb-6 max-w-[500px]">
            Veltrex.Devs is a product engineering studio focused on building apps, web platforms, and AI-based solutions. We don't run body shops or churn JIRA tickets — we partner deeply with startups and growth companies to ship products that matter.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-700 text-base leading-relaxed max-w-[500px]">
            We focus on speed, quality, and innovation while building scalable digital products.
          </motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }} className="relative">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            <ClipRevealImage src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80" alt="Veltrex.Devs team" isInView={isInView} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050709]/70 via-transparent to-transparent" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.7, y: 20 }} animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.1 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl">
              <div className="text-[10px] text-gray-600 mb-1 uppercase tracking-widest">Founded</div>
              <div className="text-[2rem] font-black text-white leading-none">2025</div>
              <div className="text-[10px] mt-1" style={{ color: GOLD }}>Bengaluru, India</div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.7, y: -20 }} animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.3 }}>
            <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 6.5, delay: 1.2, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                <span className="text-[13px] text-gray-300 font-medium">Actively taking projects</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PILLARS — all gold, magnetic ────────────────────────────────────────────
function MagneticPillarCard({ p, i }: { p: typeof pillars[0]; i: number }) {
  const { ref, springX, springY } = useMagnetic(0.18);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} variants={fadeScale}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative group cursor-pointer">
      <motion.div className="absolute -inset-[1px] rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${GOLD}50, rgba(200,169,126,0.15))` }}
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }} />
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.5 }}
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${GOLD}06, transparent)` }} />
      <div className="relative bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-9 h-full flex gap-7">
        <motion.div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}
          animate={{ rotate: hovered ? 8 : 0, scale: hovered ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          <FontAwesomeIcon icon={p.icon} style={{ color: GOLD, fontSize: "1.3rem" }} />
        </motion.div>
        <div>
          <motion.div className="text-[1.1rem] font-bold mb-1 leading-tight"
            animate={{ color: hovered ? GOLD : "#ffffff" }} transition={{ duration: 0.3 }}
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {p.title}
          </motion.div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: `${GOLD}70` }}>
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
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 40% at 20% 60%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mb-20">
          <motion.div variants={fadeUp}><SectionLabel>Why Us</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white max-w-[560px]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
            {"Built on four non-negotiables."}
          </SplitHeading>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 gap-5">
          {pillars.map((p, i) => <MagneticPillarCard key={p.title} p={p} i={i} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── DIFFERENTIATORS — all gold ───────────────────────────────────────────────
function DifferentiatorsSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 55% 40% at 75% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_480px] gap-20 items-start">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>What Makes Us Different</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
            {"We operate like a product team."}
          </SplitHeading>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed max-w-[400px]">
            Most studios take briefs and deliver code. We take ownership and deliver outcomes.
          </motion.p>
        </motion.div>
        <div className="space-y-3 pt-2">
          {differentiators.map((d, i) => (
            <motion.div key={d.label}
              initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 6, borderColor: GOLD_BORDER }}
              className="flex items-center gap-5 bg-[#0a0c12] border border-white/[0.06] rounded-2xl px-6 py-5 transition-colors duration-300 group cursor-pointer">
              <motion.div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
                whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                ✓
              </motion.div>
              <div>
                <div className="text-white text-sm font-semibold">{d.label}</div>
                <div className="text-gray-700 text-xs mt-0.5">{d.sub}</div>
              </div>
              <motion.div className="ml-auto" animate={{ x: 0, opacity: 0.3 }} whileHover={{ x: 4, opacity: 1 }}>
                <FontAwesomeIcon icon={faArrowRight} style={{ color: GOLD }} className="text-xs" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TIMELINE — gold SVG path, gold dots ─────────────────────────────────────
function TimelineSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 40% at 15% 60%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mb-20">
          <motion.div variants={fadeUp}><SectionLabel>Our Story</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
            {"Five years of shipping."}
          </SplitHeading>
        </motion.div>
        <div className="relative">
          <svg className="absolute left-[26px] md:left-1/2 top-0 h-full w-px overflow-visible" style={{ transform: "translateX(-50%)" }}>
            <motion.line x1="0" y1="0" x2="0" y2="100%"
              stroke="url(#goldTimelineGrad)" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
            <defs>
              <linearGradient id="goldTimelineGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor={GOLD}     stopOpacity="0.8" />
                <stop offset="50%"  stopColor="#e8c89a"  stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a07848"  stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="space-y-12">
            {timeline.map((item, i) => {
              const accent = GOLD_STOPS[i];
              return (
                <motion.div key={item.year}
                  initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Gold pulse dot */}
                  <motion.div
                    className="absolute left-0 md:left-1/2 top-1.5 w-[52px] h-[52px] -translate-x-0 md:-translate-x-1/2 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-[#0a0c12]"
                    style={{ border: `1px solid ${GOLD_BORDER}` }}
                    initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}}
                    transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.5 + i * 0.12 }}
                    whileHover={{ scale: 1.2, borderColor: GOLD, boxShadow: `0 0 20px ${GOLD}30` }}>
                    <span className="text-[10px] font-black font-mono" style={{ color: GOLD }}>
                      {item.year.slice(2)}
                    </span>
                    <motion.div className="absolute inset-0 rounded-full border" style={{ borderColor: GOLD }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }} />
                  </motion.div>
                  {/* Card — gold border on hover */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: GOLD_BORDER }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`ml-16 md:ml-0 bg-[#0a0c12] border border-white/[0.06] rounded-2xl px-7 py-6 md:w-[44%] transition-colors duration-300 ${i % 2 === 0 ? "md:mr-auto md:ml-0 md:pr-12" : "md:ml-auto md:pl-12"}`}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: GOLD, opacity: 0.8 }}>
                      {item.year}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.event}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TEAM — gold, tilt cards ──────────────────────────────────────────────────
function TeamCard({ member }: { member: typeof team[0] }) {
  const { ref, springX, springY } = useMagnetic(0.12);
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRY = useSpring(rotateY, { stiffness: 150, damping: 20 });
  const [hovered, setHovered] = useState(false);
  return (
  <div className="group relative overflow-hidden rounded-2xl">
    
    <div className="relative h-[320px] sm:h-[360px] lg:h-[420px] w-full overflow-hidden">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="text-white text-lg font-semibold">
        {member.name}
      </h3>
      <p className="text-gray-300 text-sm">
        {member.role}
      </p>
    </div>

  </div>
);
}

function TeamSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-20">
          <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>The Team</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="font-black leading-[1.05] tracking-[-0.028em] text-white mx-auto"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", display: "block" }}>
            {"Senior engineers, every one."}
          </SplitHeading>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
  <TeamCard key={i} member={member} />
))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-40 bg-[#050709] relative overflow-hidden">
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
        <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>Work With Us</SectionLabel></motion.div>
        <SplitHeading isInView={isInView} delay={0.05}
          className="font-black leading-[0.92] tracking-[-0.035em] text-white mb-8 mx-auto block"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", maxWidth: "880px" }}>
          {"Let's build something"}
        </SplitHeading>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.55 }} className="mb-14">
          <span className="font-black leading-none tracking-[-0.035em] block italic"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
            extraordinary.
          </span>
        </motion.div>
        <motion.p variants={fadeUp} className="text-gray-600 text-xl mb-14 max-w-sm mx-auto leading-relaxed">
          Startup idea or enterprise project — let's build it together.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          {/* Gold gradient primary */}
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
          {/* Ghost */}
          <motion.a href="/services"
            whileHover={{ y: -4, borderColor: GOLD_BORDER, color: GOLD }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 text-gray-500 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1] min-w-[200px] justify-center">
            View Services <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
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