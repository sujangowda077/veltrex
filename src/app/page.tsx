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
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useEffect } from "react";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreenButton,
  faLaptopCode,
  faRobot,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faStar,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";


// ─── Gold design tokens ───────────────────────────────────────────────────────
const GOLD        = "#c8a97e";
const GOLD_DIM    = "rgba(200,169,126,0.5)";
const GOLD_SOFT   = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

const Particles = dynamic(() => import("@tsparticles/react"), { ssr: false });

function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

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

// ─── Text scramble ────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
function useScramble(target: string, trigger: boolean, speed = 35) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const total = target.length * 6;
    const interval = setInterval(() => {
      setDisplay(
        target.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iteration / 6) return target[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
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
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix; },
    });
    return controls.stop;
  }, [isInView, to, suffix, prefix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── Magnetic hook ────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
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
          style={{
  display: "inline-block",
  whiteSpace: "pre",
  wordBreak: "keep-all",
}}>
          {char}
        </motion.span>
      ))}
    </Tag>
  );
}

// ─── Clip-reveal image ────────────────────────────────────────────────────────
function ClipRevealImage({ src, alt, isInView }: { src: string; alt: string; isInView: boolean }) {
  return (
    <motion.div className="w-full h-full"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}>
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
      transition={{
        rotate: { duration, repeat: Infinity, ease: "linear", delay },
        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}>
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

// ─── Section label ────────────────────────────────────────────────────────────
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

// ─── Gold CTA Button — replaces PremiumMagneticTiltButton for primary ─────────
function GoldButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * 0.22);
      y.set((e.clientY - r.top - r.height / 2) * 0.22);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [x, y]);

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} className={className}>
      <motion.a href={href}
        whileHover={{ scale: 1.06, boxShadow: `0 20px 40px ${GOLD}35` }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="inline-flex items-center justify-center gap-2.5 font-bold text-[0.9rem] px-8 py-4 rounded-full shadow-2xl relative overflow-hidden text-[#0e0d0c] min-w-[200px]"
        style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}>
        {/* Shimmer sweep */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
        <span className="relative z-10">{children}</span>
      </motion.a>
    </motion.div>
  );
}

// ─── Ghost Button ─────────────────────────────────────────────────────────────
function GhostButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.a href={href}
      whileHover={{ y: -3, borderColor: GOLD_BORDER, color: GOLD, boxShadow: `0 8px 24px ${GOLD}15` }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`inline-flex items-center justify-center gap-2.5 font-medium text-[0.9rem] px-8 py-4 rounded-full border border-white/[0.1] text-gray-400 min-w-[180px] transition-colors duration-200 ${className}`}>
      {children}
    </motion.a>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: 3, suffix: "+", label: "Projects Built" },
  { value: 4, suffix: "", label: "Core Team" },
  { value: 3, suffix: "+", label: "Active Products" },
  { value: 100, suffix: "+", label: "Users Testing" },
];

const services = [
  {
    icon: faMobileScreenButton, number: "01", title: "Mobile Applications",
    description: "Native and cross-platform apps engineered for performance. We build for iOS and Android with care for every interaction, from onboarding to power-user flows.",
    stack: ["React Native", "Swift", "Kotlin", "Flutter"],
    outcomes: "AI features that actually improve user experience",
    accentFrom: "#fbcd92", accentTo: "#FFAE42",
    labelColor: "bg-[#FFAE42]/10 text-[#e6d3b3] border border-[#FFAE42]/20",
    iconBg: "bg-[#FFAE42]/10", iconColor: "text-[#FFAE42]",
  },
  {
    icon: faLaptopCode, number: "02", title: "Web Platforms",
    description: "High-performance SaaS, dashboards, and marketing sites. Obsessive attention to load times, conversion, and long-term maintainability.",
    stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    outcomes: "Fast, responsive, and scalable web apps",
    accentFrom: "#ff9f7f", accentTo: "#F86939",
    labelColor: "bg-[#F86939]/10 text-[#F86939] border border-[#F86939]/20",
    iconBg: "bg-[#F86939]/10", iconColor: "text-[#F86939]",
  },
  {
    icon: faRobot, number: "03", title: "AI & Automation",
    description: "LLM-powered features, RAG pipelines, and intelligent automation that turns your product into an unfair advantage. Deeply integrated, not bolted on.",
    stack: ["LangChain", "OpenAI", "Python", "Pinecone"],
    outcomes: "Built with focus on performance and usability",
    accentFrom: "#b75250", accentTo: "#B32624",
    labelColor: "bg-[#B32624]/10 text-[#B32624] border border-[#B32624]/20",
    iconBg: "bg-[#B32624]/10", iconColor: "text-[#B32624]",
  },
];

const projects = [
  {
    image: "/assets/project/sidequest.png",
    title: "SideQuest",
    tagline: "Campus app for ordering food, printing, and student services.",
    stack: ["Next.js", "Node.js"],
    category: "Campus App",
    accent: GOLD,
  },
  {
    image: "/assets/project/onyx.png",
    title: "Onyx",
    tagline: "AI-based interview training platform to improve communication and confidence.",
    stack: ["AI", "Next.js"],
    category: "AI Platform",
    accent: "#e8c89a",
  },
  {
    image: "/assets/project/officdocs.png",
    title: "OfficeDocs",
    tagline: "LLM-based system that reads PDFs and answers questions instantly.",
    stack: ["LangChain", "Python"],
    category: "AI Tool",
    accent: "#a07848",
  },
  {
    image: "", // no image
    title: "Timetable Planner",
    tagline: "Smart timetable planner for students (in development).",
    stack: ["Next.js"],
    category: "Productivity",
    accent: GOLD,
  },
];

const testimonials = [
  {
    name: "Student User",
    role: "Campus User",
    initials: "SU",
    from: GOLD,
    to: "#e8c89a",
    quote: "SideQuest made ordering and printing inside campus super easy.",
  },
  {
    name: "Beta User",
    role: "Onyx User",
    initials: "BU",
    from: "#e8c89a",
    to: GOLD,
    quote: "Onyx helped me improve how I speak during interviews.",
  },
  {
    name: "Early Tester",
    role: "OfficeDocs User",
    initials: "ET",
    from: "#a07848",
    to: GOLD,
    quote: "Reading PDFs and getting answers instantly is very useful.",
  },
];

const differentiators = [
  { label: "Student-built", sub: "Learning by building real products" },
  { label: "Fast execution", sub: "We build and iterate quickly" },
  { label: "Practical solutions", sub: "Focused on real use cases" },
  { label: "AI-driven", sub: "Using AI where it actually helps" },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  
  const [scrambled, setScrambled] = useState(false);
  const headline = useScramble("software", scrambled, 32);
  useEffect(() => { const t = setTimeout(() => setScrambled(true), 700); return () => clearTimeout(t); }, []);

  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050709] pt-20">
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
      </div>

      {/* Orbit rings */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] pointer-events-none hidden xl:block">
        <OrbitRing color={GOLD}    size={440} duration={22} />
        <OrbitRing color="#e8c89a" size={320} duration={15} delay={3} />
        <OrbitRing color="#a07848" size={200} duration={9}  delay={6} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)` }} />
      </div>

      <Particles id="tsparticles-hero" 
        options={{
          background: { color: { value: "transparent" } }, fpsLimit: 90,
          interactivity: { events: { onHover: { enable: true, mode: "grab" }, resize: {
  enable: true
} }, modes: { grab: { distance: 150, links: { opacity: 0.25 } } } },
          particles: {
            color: { value: GOLD },
            links: { color: GOLD, distance: 160, enable: true, opacity: 0.1, width: 0.6 },
            move: { enable: true, speed: 0.45, outModes: "out" },
            number: {
  density: {
    enable: true,
    width: 1100,
    height: 1100
  },
  value: 45
},
            opacity: { value: { min: 0.08, max: 0.3 } },
            shape: { type: "circle" }, size: { value: { min: 0.5, max: 2 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0" />

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[1fr_360px] gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-10">

            {/* Badge */}
            <motion.div variants={fadeUp}>
              <motion.span
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase relative overflow-hidden"
                style={{ border: `1px solid ${GOLD_BORDER}`, background: GOLD_SOFT, color: GOLD }}
                whileHover={{ borderColor: `${GOLD}50` }}>
                <motion.div className="absolute inset-0"
                  style={{ background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(200,169,126,0.12), rgba(0,0,0,0))` }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                Software Studio · Bengaluru, India
              </motion.span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1 className="text-[clamp(3.2rem,7.5vw,6.2rem)] font-black leading-[0.92] tracking-[-0.035em] text-white"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                We build
                <br />
                <span style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontFamily: scrambled ? "'DM Serif Display', Georgia, serif" : "monospace",
                }}>
                  {headline}
                </span>
                <br />
                that scales.
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-[1.15rem] text-gray-500 max-w-[500px] leading-[1.8] font-light">
             AI tools, mobile apps, and web platforms — built by students focused on solving real-world problems.
            </motion.p>

            {/* ── CTA BUTTONS — plain motion.a so gold gradient is always visible ── */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-1">
              <GoldButton href="/contact">
                Start Your Project →
              </GoldButton>
              <GhostButton href="/projects">
                View Our Work ↗
              </GhostButton>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[{ i: "AM", c: GOLD }, { i: "PS", c: "#e8c89a" }, { i: "RK", c: "#a07848" }, { i: "VT", c: GOLD }].map(({ i, c }, idx) => (
                  <motion.div key={idx}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-[#050709]"
                    style={{ background: `${c}18`, border: `1px solid ${c}35`, color: c }}>
                    {i}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm" style={{ color: GOLD }}>
                Built by  <span className="font-medium">a small team</span> of builders.
              </p>
            </motion.div>
          </motion.div>

          {/* Right card */}
          <motion.div initial={{ opacity: 0, x: 28, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
              <ClipRevealImage
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
                alt="Dashboard preview" isInView={true} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050709]/70 via-transparent to-transparent" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.7, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.2 }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl">
                <div className="text-[10px] text-gray-600 mb-1 uppercase tracking-widest">Performance</div>
                <div className="text-[2rem] font-black text-white leading-none">95+</div>
                <div className="text-[10px] mt-1" style={{ color: GOLD }}>Lighthouse Score</div>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.7, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 1.4 }}>
              <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 6.5, delay: 1.2, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-[#0c0e14] border border-white/[0.1] rounded-2xl px-5 py-3.5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  <span className="text-[13px] text-gray-300 font-medium">3 projects in sprint</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: `1px solid ${GOLD_BORDER}` }}>
          <div className="w-0.5 h-2 rounded-full" style={{ background: GOLD_DIM }} />
        </motion.div>
      </motion.div>
    </header>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function StatsSection() {
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
        className="max-w-[1180px] mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4">
        {stats.map(({ value, suffix, label }, i) => (
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
              <AnimatedCounter to={value} suffix={suffix} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: `${GOLD}60` }}>{label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── SERVICE CARD ─────────────────────────────────────────────────────────────
function ServiceCard({ svc, i, hovered, setHovered }: { svc: typeof services[0]; i: number; hovered: number | null; setHovered: (v: number | null) => void }) {
  const { ref: magRef, springX, springY } = useMagnetic(0.15);
  const isHov = hovered === i;
  return (
    <motion.div ref={magRef} style={{ x: springX, y: springY }} variants={fadeScale}
      onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
      className="relative group cursor-pointer">
      <motion.div className="absolute -inset-[1px] rounded-3xl"
        style={{ background: `linear-gradient(135deg, ${GOLD}50, ${svc.accentFrom}30)` }}
        animate={{ opacity: isHov ? 1 : 0 }} transition={{ duration: 0.4 }} />
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: isHov ? 1 : 0 }} transition={{ duration: 0.5 }}
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${GOLD}06, transparent)` }} />
      <div className="relative bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-9 h-full flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <motion.div className={`w-[52px] h-[52px] rounded-2xl ${svc.iconBg} flex items-center justify-center`}
            animate={{ rotate: isHov ? 8 : 0, scale: isHov ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}>
            <FontAwesomeIcon icon={svc.icon} className={`text-[1.4rem] ${svc.iconColor}`} />
          </motion.div>
          <motion.span className="text-[0.65rem] font-bold tracking-[0.2em] font-mono"
            animate={{ color: isHov ? GOLD : "#3d3a36" }} transition={{ duration: 0.3 }}>
            {svc.number}
          </motion.span>
        </div>
        <motion.h3 className="text-[1.15rem] font-bold mb-4 leading-tight"
          animate={{ color: isHov ? GOLD : "#ffffff" }} transition={{ duration: 0.3 }}
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {svc.title}
        </motion.h3>
        <p className="text-gray-600 text-sm leading-[1.85] mb-8 flex-1">{svc.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {svc.stack.map((t) => (
            <span key={t} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${svc.labelColor}`}>{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-5 border-t border-white/[0.05] text-[11px]"
          style={{ color: `${GOLD}50` }}>
          <FontAwesomeIcon icon={faCheckCircle} style={{ color: isHov ? GOLD : svc.accentFrom, opacity: 0.6 }} />
          <span>{svc.outcomes}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ServicesSection() {
  const { ref, isInView } = useFadeIn();
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 55% 40% at 75% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="max-w-[600px] mb-24">
          <motion.div variants={fadeUp}><SectionLabel>Capabilities</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.028em] text-white mb-6"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {"Full-stack expertise,"}
          </SplitHeading>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }} className="text-gray-600 text-[1.3rem] font-light mb-4">
            zero hand-holding.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed">
            We handle the entire product lifecycle — strategy, design, engineering, and deployment.
          </motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-3 gap-5">
          {services.map((svc, i) => <ServiceCard key={svc.title} svc={svc} i={i} hovered={hovered} setHovered={setHovered} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectsSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 40% at 15% 60%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="flex items-end justify-between mb-20 flex-wrap gap-6">
          <div>
            <motion.div variants={fadeUp}><SectionLabel>Selected Work</SectionLabel></motion.div>
            <SplitHeading isInView={isInView} delay={0.05}
              className="text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.028em] text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {"Products we've shipped"}
            </SplitHeading>
          </div>
          <motion.a variants={fadeUp} href="/projects"
            whileHover={{ y: -2, borderColor: GOLD_BORDER, color: GOLD }}
            className="flex items-center gap-2 text-sm text-gray-600 transition-colors duration-200 border border-white/[0.07] px-5 py-2.5 rounded-full">
            View all <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </motion.a>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 gap-4">
          <motion.div variants={fadeScale} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] h-[420px]">
              <img src={projects[0].image} alt={projects[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-[#050709]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-[11px] font-bold mb-3 uppercase tracking-[0.18em]" style={{ color: projects[0].accent }}>{projects[0].category}</div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{projects[0].title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{projects[0].tagline}</p>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: projects[0].accent }}>
                  <span>Case Study</span><FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </div>
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col gap-4">
            {[projects[1], projects[2]].map((proj) => (
              <motion.div key={proj.title} variants={fadeScale} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="group cursor-pointer flex-1">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] h-[200px]">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-[#050709]/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-[10px] font-bold mb-1.5 uppercase tracking-[0.18em]" style={{ color: proj.accent }}>{proj.category}</div>
                    <h3 className="text-[1.05rem] font-bold text-white mb-0.5">{proj.title}</h3>
                    <p className="text-gray-600 text-xs">{proj.tagline}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeScale} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="md:col-span-2 group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] h-[260px]">
              <img src={projects[3].image} alt={projects[3].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050709] via-[#050709]/60 to-transparent" />
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center p-10 max-w-lg">
                <div className="text-[11px] font-bold mb-3 uppercase tracking-[0.18em]" style={{ color: projects[3].accent }}>{projects[3].category}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{projects[3].title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{projects[3].tagline}</p>
                <div className="flex gap-2 flex-wrap">
                  {projects[3].stack.map((t) => (
                    <span key={t} className="text-[11px] bg-white/[0.05] border border-white/[0.08] text-gray-500 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRY = useSpring(rotateY, { stiffness: 150, damping: 20 });
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div ref={cardRef}
      style={{ rotateX: springRX, rotateY: springRY, transformStyle: "preserve-3d", perspective: "800px" }}
      onMouseMove={(e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        rotateX.set(((e.clientY - rect.top - rect.height / 2) / rect.height) * -10);
        rotateY.set(((e.clientX - rect.left - rect.width / 2) / rect.width) * 10);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); rotateX.set(0); rotateY.set(0); }}
      variants={fadeScale}
      className="bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-8 flex flex-col cursor-pointer relative overflow-hidden">
      <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${GOLD}06, transparent)` }} />
      <div className="text-[5rem] leading-none font-black mb-3 opacity-15 select-none h-14 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        "
      </div>
      <p className="text-gray-400 text-sm leading-[1.9] flex-1 mb-8 font-light">{t.quote}</p>
      <div className="flex items-center gap-4 pt-6 border-t border-white/[0.05]">
        <motion.div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}35`, color: GOLD }}
          animate={{ scale: hovered ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          {t.initials}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold truncate">{t.name}</div>
          <div className="text-gray-700 text-xs truncate">{t.role}</div>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.06, type: "spring", stiffness: 300 }}>
              <FontAwesomeIcon icon={faStar} className="text-yellow-500/70 text-[8px]" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TestimonialsSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#06080d] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-20">
          <motion.div variants={fadeUp} className="flex justify-center"><SectionLabel>Client Stories</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.028em] text-white mx-auto block"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {"Trusted by builders."}
          </SplitHeading>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => <TestimonialCard key={t.name} t={t} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_400px] gap-20 items-center">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>About Veltrex</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.028em] text-white mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {"A studio that cares."}
          </SplitHeading>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5 }} className="text-gray-500 text-lg leading-relaxed mb-6 max-w-[500px]">
            Veltrex.Devs is a student-built product studio focused on building real-world applications — from campus systems to AI-powered tools.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.65 }} className="text-gray-700 text-base leading-relaxed max-w-[500px]">
            We focus on solving real problems with simple, effective technology instead of overcomplicating things.
          </motion.p>
        </motion.div>
        <div className="space-y-3">
          {differentiators.map((d, i) => (
            <motion.div key={d.label}
              initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
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
              <motion.div className="ml-auto" animate={{ opacity: 0.3 }} whileHover={{ opacity: 1, x: 4 }}>
                <FontAwesomeIcon icon={faArrowRight} style={{ color: GOLD }} className="text-xs" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
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
          className="text-[clamp(3rem,8vw,6.5rem)] break-words font-black leading-[0.92] tracking-[-0.035em] text-white mb-4 mx-auto block"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", maxWidth: "880px" }}>
          {"Let's build"}
        </SplitHeading>
        <SplitHeading isInView={isInView} delay={0.05}
          className="text-[clamp(3rem,8vw,6.5rem)] break-words font-black leading-[0.92] tracking-[-0.035em] text-white mb-4 mx-auto block"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", maxWidth: "880px" }}>
          {"something"}
        </SplitHeading>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.55 }} className="mb-14">
          <span className="font-black leading-none tracking-[-0.035em] block italic"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(3rem,8vw,6.5rem)",
              background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
            extraordinary.
          </span>
        </motion.div>
        <motion.p variants={fadeUp} className="text-gray-600 text-xl mb-14 max-w-md mx-auto leading-relaxed">
          Have an idea? Let’s build something real together.
        </motion.p>

        {/* ── CTA BUTTONS — plain motion.a, gold gradient always visible ── */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          <GoldButton href="/contact">
            Start Your Project →
          </GoldButton>
          <GhostButton href="mailto:team@veltrex.co.in">
            team@veltrex.co.in
          </GhostButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function ContactSection() {
  const { ref, isInView } = useFadeIn();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };
  const inputClass = "w-full bg-white/[0.025] border border-white/[0.07] rounded-xl px-5 py-4 text-white text-sm placeholder-gray-800 focus:outline-none transition-all duration-300 resize-none";
  return (
    <section ref={ref} id="contact" className="py-36 bg-[#050709] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 45% 60% at 85% 50%, ${GOLD_SOFT}, transparent)` }} />
      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-2 gap-20 items-start">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <motion.div variants={fadeUp}><SectionLabel>Contact</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05}
            className="text-[clamp(2.4rem,4.5vw,3.5rem)] font-black leading-[1.05] tracking-[-0.028em] text-white mb-6"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {"Let's talk about"}
          </SplitHeading>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }} className="text-gray-600 text-[1.3rem] font-light mb-10">
            your project.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.65 }}
            className="text-gray-600 text-base leading-relaxed mb-14 max-w-[380px]">
            Describe what you're building. We respond within 4 hours on business days.
          </motion.p>
          <div className="space-y-5">
            {[
              { icon: faEnvelope,     label: "Email",     value: "team@veltrex.co.in" },
              { icon: faPhone,        label: "WhatsApp",  value: "+91 70206 72841" },
              { icon: faMapMarkerAlt, label: "Studio",    value: "Bengaluru, Karnataka" },
            ].map(({ icon, label, value }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1, borderColor: GOLD_BORDER }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                  style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
                  <FontAwesomeIcon icon={icon} className="text-sm" style={{ color: GOLD }} />
                </motion.div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: `${GOLD}50` }}>{label}</div>
                  <div className="text-gray-400 text-sm font-medium">{value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div className="bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-14">
                  <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" style={{ color: GOLD }} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Message received.</h3>
                  <p className="text-gray-600 text-sm">We'll reply within 4 hours.</p>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {[{ id: "name", label: "Name", type: "text", placeholder: "Your name" },
                      { id: "email", label: "Email", type: "email", placeholder: "you@company.com" }].map(({ id, label, type, placeholder }) => (
                      <div key={id}>
                        <label className="block text-[10px] text-gray-700 mb-2 uppercase tracking-wider">{label}</label>
                        <div className="relative">
                          <motion.input type={type} placeholder={placeholder}
                            value={form[id as keyof typeof form]}
                            onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
                            onFocus={() => setFocused(id)} onBlur={() => setFocused(null)}
                            required className={inputClass}
                            animate={{ borderColor: focused === id ? GOLD_BORDER : "rgba(255,255,255,0.07)" }}
                            style={{ boxShadow: focused === id ? `0 0 0 3px ${GOLD_SOFT}` : "none" } as any} />
                          <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                            style={{ background: `linear-gradient(90deg, ${GOLD}, #e8c89a)` }}
                            animate={{ scaleX: focused === id ? 1 : 0, opacity: focused === id ? 1 : 0 }}
                            initial={{ scaleX: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-700 mb-2 uppercase tracking-wider">Project Details</label>
                    <div className="relative">
                      <motion.textarea rows={5} placeholder="What are you building? What's your timeline?"
                        value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                        required className={inputClass}
                        animate={{ borderColor: focused === "message" ? GOLD_BORDER : "rgba(255,255,255,0.07)" }}
                        style={{ boxShadow: focused === "message" ? `0 0 0 3px ${GOLD_SOFT}` : "none" } as any} />
                      <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg, ${GOLD}, #e8c89a)` }}
                        animate={{ scaleX: focused === "message" ? 1 : 0, opacity: focused === "message" ? 1 : 0 }}
                        initial={{ scaleX: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
                    </div>
                  </div>
                  <motion.button type="submit"
                    whileHover={{ y: -2, boxShadow: `0 12px 30px ${GOLD}25` }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold py-4 rounded-xl text-[0.88rem] tracking-wide relative overflow-hidden text-[#0e0d0c]"
                    style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
                      animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} />
                    <span className="relative z-10">Send Message →</span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <GrainOverlay />
      <SpotlightCursor />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <AboutSection />
      <CTASection />
      <ContactSection />
    </>
  );
}