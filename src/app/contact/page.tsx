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
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faPhone, faMapMarkerAlt, faArrowRight,
  faCheckCircle, faClock, faShieldHalved, faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";

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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

// ─── Text scramble ────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
function useScramble(target: string, trigger: boolean, speed = 34) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    let iter = 0;
    const total = target.length * 6;
    const id = setInterval(() => {
      setDisplay(
        target.split("").map((c, i) => {
          if (c === " ") return " ";
          if (i < iter / 6) return target[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      iter++;
      if (iter > total) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [trigger, target, speed]);
  return display;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return ctrl.stop;
  }, [isInView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ─── Char-split heading ───────────────────────────────────────────────────────
function SplitHeading({
  children, className, style, isInView, delay = 0, tag = "h1",
}: {
  children: string; className?: string; style?: React.CSSProperties;
  isInView: boolean; delay?: number; tag?: "h1" | "h2";
}) {
  const Tag = tag as any;
  return (
    <Tag className={className} style={style}>
      {children.split("").map((ch, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.018, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}>
          {ch}
        </motion.span>
      ))}
    </Tag>
  );
}

// ─── Parallax layer ───────────────────────────────────────────────────────────
function ParallaxLayer({ children, speed = 0.15, className }: {
  children: React.ReactNode; speed?: number; className?: string;
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

// ─── Orbit ring — gold palette ────────────────────────────────────────────────
function OrbitRing({ color, size, duration, delay = 0 }: {
  color: string; size: number; duration: number; delay?: number;
}) {
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
      <motion.div
        className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: color, boxShadow: `0 0 10px ${color}, 0 0 20px ${color}60` }}
      />
    </motion.div>
  );
}

// ─── Magnetic hook ────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.18) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
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
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, strength]);
  return { ref, sx, sy };
}

// ─── Mailto builder ───────────────────────────────────────────────────────────
function buildMailto(subject: string, body: string) {
  return `mailto:team@veltrex.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[998] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }} />
  );
}

// ─── Section label — gold hairlines ──────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 mb-5">
      <motion.div
        className="h-[1px]"
        style={{ background: GOLD_DIM }}
        initial={{ width: 0 }} whileInView={{ width: 20 }} viewport={{ once: true }}
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
        initial={{ width: 0 }} whileInView={{ width: 20 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const PREFILL_BODY = [
  "Hi Veltrex.Devs team,",
  "",
  "I found you through your website and would like to discuss a project.",
  "",
  "Project details:",
  "- Type: [Mobile App / Web Platform / AI / SaaS / MVP]",
  "- Description: [Brief description]",
  "- Budget: [Your budget range]",
  "- Timeline: [When do you need it?]",
  "",
  "My details:",
  "- Name: ",
  "- Company: ",
  "- Best time to connect: ",
  "",
  "Looking forward to hearing from you!",
].join("\n");

const contactInfo = [
  {
    icon: faEnvelope,
    label: "Email",
    value: "team@veltrex.co.in",
    sub: "We reply within 4 hours",
    href: buildMailto("Project enquiry — [Your name]", PREFILL_BODY),
    external: false,
  },
  {
    icon: faPhone,
    label: "WhatsApp",
    value: "+91 98765 43210",
    sub: "Mon – Fri, 9am – 7pm IST",
    href: `https://wa.me/919876543210?text=${encodeURIComponent("Hi Veltrex.Devs! I found you through your website and I'd like to discuss a project. Could we set up a quick call?")}`,
    external: true,
  },
  {
    icon: faMapMarkerAlt,
    label: "Studio",
    value: "Bengaluru, Karnataka",
    sub: "India · UTC+5:30",
    href: "https://maps.google.com/?q=Bengaluru,Karnataka,India",
    external: true,
  },
];

const promises = [
  { icon: faClock,        label: "4-hour response",  sub: "On all business days"       },
  { icon: faShieldHalved, label: "NDA on request",   sub: "Your idea stays yours"      },
  { icon: faRocket, label: "Quick response", sub: "We get back within hours" },
  { icon: faCheckCircle,  label: "No obligation",    sub: "Just an honest conversation" },
];


const projectTypes = ["Mobile App", "Web Platform", "AI / Automation", "SaaS Product", "MVP / Prototype", "Other"];

const faqs = [
  { q: "How quickly can you start?",              a: "We typically kick off within 1–2 weeks of signing. We always have a sprint slot reserved for new partners." },
  { q: "Do you work with early-stage startups?",  a: "Absolutely. Some of our best work has been zero-to-one MVPs. We'll help you scope it right." },
  { q: "What does a typical engagement look like?", a: "Discovery → Proposal → Kickoff → Weekly sprints with demos. You're never in the dark." },
  { q: "Can I hire a dedicated team?",            a: "Yes. We offer dedicated squad models for longer engagements — product manager, designers, and engineers." },
];

// ─── Focus input — gold underline ─────────────────────────────────────────────
const baseInput =
  "w-full bg-white/[0.025] border border-white/[0.07] rounded-xl px-5 py-4 text-white text-sm placeholder-gray-800 focus:outline-none transition-all duration-300 font-light";

function FocusInput({
  label, type = "text", placeholder, value, onChange, required = false, colSpan = false,
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; colSpan?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <label className="block text-[10px] text-gray-700 mb-2 uppercase tracking-[0.18em] font-semibold">
        {label}{required && <span className="ml-1" style={{ color: GOLD }}>*</span>}
      </label>
      <div className="relative">
        <motion.input
          type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} className={baseInput}
          animate={{ borderColor: focused ? GOLD_BORDER : "rgba(255,255,255,0.07)" }}
          style={{ boxShadow: focused ? `0 0 0 3px ${GOLD_SOFT}` : "none" } as any}
        />
        {/* Gold focus underline */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
          style={{ background: `linear-gradient(90deg, ${GOLD}, #e8c89a)` }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          initial={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function ContactHero() {
  const scrambled = useScramble("something", true, 30);

  return (
    <section className="relative min-h-[54vh] flex items-center overflow-hidden bg-[#050709] pt-24 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold top hairline */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0, originX: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(0,245,255,0.03),transparent)]" />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Warm gold ambient bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${GOLD_SOFT} 0%, rgba(0,0,0,0) 70%)` }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />
      </div>

      {/* Orbit rings — gold palette */}
      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none hidden xl:block">
        <OrbitRing color={GOLD}      size={360} duration={20} />
        <OrbitRing color="#e8c89a"   size={260} duration={14} delay={2} />
        <OrbitRing color="#a07848"   size={160} duration={8}  delay={5} />
        {/* Gold glowing core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}20 0%, rgba(0,0,0,0) 70%)` }} />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[680px]">

          {/* Badge — gold shimmer */}
          <motion.div variants={fadeUp}>
            <motion.span
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase relative overflow-hidden mb-7 block w-fit"
              style={{
                border: `1px solid ${GOLD_BORDER}`,
                background: GOLD_SOFT,
                color: GOLD,
              }}
              whileHover={{ borderColor: `${GOLD}50` }}>
              <motion.div className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(200,169,126,0.12), rgba(0,0,0,0))` }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
              Get In Touch
            </motion.span>
          </motion.div>

          <SplitHeading isInView={true} delay={0.1}
            className="font-black leading-[0.92] tracking-[-0.035em] text-white mb-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 7.5vw, 5.8rem)" }}>
            {"Let's build"}
          </SplitHeading>

          {/* Scramble line — gold gradient */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
            <div className="font-black leading-[0.92] tracking-[-0.035em] mb-3"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(3rem, 7.5vw, 5.8rem)",
                background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {scrambled}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="font-black leading-[0.92] tracking-[-0.035em] text-gray-500 mb-8"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem, 7.5vw, 5.8rem)" }}>
            extraordinary.
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-[1.1rem] text-gray-500 max-w-[480px] leading-[1.8] font-light">
            Tell us what you're building. We'll come back with a proposal that's scoped, priced, and honest.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator — gold */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: `1px solid ${GOLD_BORDER}` }}>
          <div className="w-0.5 h-2 rounded-full" style={{ background: GOLD_DIM }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── PROMISES STRIP — gold icons & hairlines ──────────────────────────────────
function PromisesStrip() {
  const { ref, isInView } = useFadeIn();
  return (
    <section ref={ref} className="relative bg-[#050709]">
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
      <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4">
        {promises.map(({ icon, label, sub }, i) => (
          <motion.div key={label} variants={fadeUp}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="flex items-center gap-4 px-6 relative cursor-default">
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8"
                style={{ background: GOLD_BORDER }} />
            )}
            <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}
              whileHover={{ scale: 1.15, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}>
              <FontAwesomeIcon icon={icon} className="text-sm" style={{ color: GOLD }} />
            </motion.div>
            <div>
              <div className="text-white text-[13px] font-semibold leading-tight">{label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: `${GOLD}60` }}>{sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── CONTACT MAIN ─────────────────────────────────────────────────────────────
function ContactMain() {
  const { ref, isInView } = useFadeIn();
  const [form, setForm] = useState({
    name: "", email: "", company: "", message: "", projectType: "",
  });
  const [sent,       setSent]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [focusedMsg, setFocusedMsg] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:   JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please email us directly.");
        setLoading(false);
        return;
      }
      setSent(true);
      setForm({ name: "", email: "", company: "", message: "", projectType: "" });
    } catch {
      setError("Network error. Please email team@veltrex.co.in directly.");
    } finally {
      setLoading(false);
    }
  };

  const dynamicMailto = buildMailto(
    `Project enquiry${form.name ? ` from ${form.name}` : ""}`,
    [
      "Hi Veltrex.Devs team,",
      "",
      "I'd like to discuss a project.",
      "",
      form.name        ? `Name: ${form.name}`        : "",
      form.email       ? `Email: ${form.email}`      : "",
      form.company     ? `Company: ${form.company}`  : "",
      form.projectType ? `Type: ${form.projectType}` : "",
      "",
      "Details:",
      form.message || "[Please describe your project]",
      "",
      "Looking forward to hearing from you!",
    ].filter((l) => l !== undefined).join("\n")
  );

  return (
    <section ref={ref} className="py-28 bg-[#06080d] relative overflow-hidden">
      {/* Gold ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 55% 60% at 80% 40%, ${GOLD_SOFT}, transparent)` }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 40% 50% at 10% 70%, rgba(200,169,126,0.04), transparent)` }} />

      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[380px_1fr] gap-16 xl:gap-24 items-start">

        {/* ── SIDEBAR ──────────────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="lg:sticky lg:top-32 space-y-10">

          {/* Contact info cards */}
          <div className="space-y-3">
            <motion.p variants={fadeUp}
              className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-5"
              style={{ color: `${GOLD}60` }}>
              Reach us directly
            </motion.p>

            {contactInfo.map(({ icon, label, value, sub, href, external }, ci) => {
              const { ref: magRef, sx, sy } = useMagnetic(0.12);
              return (
                <motion.div key={label} ref={magRef} style={{ x: sx, y: sy }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.1 + ci * 0.1, ease: [0.16, 1, 0.3, 1] }}>
                  <motion.a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    whileHover={{ x: 4, borderColor: GOLD_BORDER }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="flex items-center gap-4 bg-[#0a0c12] border border-white/[0.06] rounded-2xl px-5 py-4 transition-colors duration-300 group block">
                    <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                      <FontAwesomeIcon icon={icon} className="text-sm" style={{ color: GOLD }} />
                    </motion.div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest mb-0.5"
                        style={{ color: `${GOLD}50` }}>{label}</div>
                      <div className="text-gray-200 text-sm font-medium truncate">{value}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: `${GOLD}50` }}>{sub}</div>
                    </div>
                    <motion.div className="ml-auto" animate={{ opacity: 0.3 }}
                      whileHover={{ opacity: 1, x: 3 }}>
                      <FontAwesomeIcon icon={faArrowRight} style={{ color: GOLD }} className="text-[10px] flex-shrink-0" />
                    </motion.div>
                  </motion.a>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={fadeUp}
            className="h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />

          {/* Social links */}
          <motion.div variants={stagger} className="space-y-3">
            <motion.p variants={fadeUp}
              className="text-[10px] uppercase tracking-[0.2em] font-semibold"
              style={{ color: `${GOLD}60` }}>
              Follow our work
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3">
              {[
                { icon: faGithub,   label: "GitHub",   href: "https://github.com"   },
                { icon: faLinkedin, label: "LinkedIn", href: "https://linkedin.com" },
                { icon: faTwitter,  label: "Twitter",  href: "https://twitter.com"  },
              ].map(({ icon, label, href }) => (
                <motion.a key={label} href={href} aria-label={label}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -3, borderColor: GOLD_BORDER, color: GOLD }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-10 h-10 rounded-xl border border-white/[0.07] flex items-center justify-center text-gray-600 transition-colors duration-200">
                  <FontAwesomeIcon icon={icon} className="text-sm" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Availability badge — full gold */}
          <motion.div variants={fadeUp}
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
            <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full block relative z-10"
                style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
              <motion.span className="absolute inset-0 rounded-full border"
                style={{ borderColor: GOLD }}
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: GOLD }}>
                Currently accepting projects
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: `${GOLD}70` }}>
                Next sprint starts in 2 weeks
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── FORM ─────────────────────────────────────────────── */}
        <motion.div variants={fadeScale} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div className="bg-[#0a0c12] border border-white/[0.06] rounded-3xl p-10 md:p-12">
            <AnimatePresence mode="wait">

              {/* Success state */}
              {sent ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }} className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                    style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl" style={{ color: GOLD }} />
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="text-2xl font-black text-white mb-3"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Message sent!
                  </motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-gray-600 text-sm leading-relaxed max-w-[300px] mx-auto mb-3">
                    We've received your message and will reply within 4 hours.
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                    className="text-gray-700 text-xs">
                    Can't wait?{" "}
                    <a href={buildMailto("Following up on my enquiry",
                      "Hi,\n\nI just submitted the contact form and wanted to follow up.\n\nLooking forward to your reply!")}
                      className="underline underline-offset-2 transition-colors"
                      style={{ color: `${GOLD}70` }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = `${GOLD}70`)}>
                      Email us directly ↗
                    </a>
                  </motion.p>
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    onClick={() => setSent(false)}
                    className="mt-8 text-xs text-gray-700 hover:text-gray-400 transition-colors duration-200 underline underline-offset-4">
                    Send another message
                  </motion.button>
                </motion.div>

              ) : (
                /* Form state */
                <motion.form key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} className="space-y-7">

                  <div className="mb-9">
                    <SectionLabel>Start a Conversation</SectionLabel>
                    <h2 className="text-[1.8rem] font-black text-white tracking-[-0.025em] leading-tight"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      Tell us about<span className="text-gray-500"> your project.</span>
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <FocusInput label="Your Name"      placeholder="Rahul Verma"        value={form.name}  onChange={set("name")}  required />
                    <FocusInput label="Business Email" type="email" placeholder="rahul@company.com" value={form.email} onChange={set("email")} required />
                  </div>
                  <FocusInput label="Company / Project Name" placeholder="Acme Inc. or Project Moonshot"
                    value={form.company} onChange={set("company")} colSpan />

                  {/* Project type pills — gold selected state */}
                  <div>
                    <label className="block text-[10px] text-gray-700 mb-3 uppercase tracking-[0.18em] font-semibold">
                      Project Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {projectTypes.map((t) => {
                        const active = form.projectType === t;
                        return (
                          <motion.button key={t} type="button"
                            onClick={() => set("projectType")(active ? "" : t)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "tween", duration: 0.15 }}
                            className="px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-all duration-200"
                            style={active ? {
                              background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                              color: "#0e0d0c",
                              transform: "scale(1.05)",
                            } : {
                              border: `1px solid ${GOLD_BORDER}`,
                              color: `${GOLD}70`,
                              background: "transparent",
                            }}>
                            {t}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget pills — gold selected state */}
                  

                  {/* Textarea — gold focus */}
                  <div>
                    <label className="block text-[10px] text-gray-700 mb-2 uppercase tracking-[0.18em] font-semibold">
                      Project Details <span style={{ color: GOLD }}>*</span>
                    </label>
                    <div className="relative">
                      <motion.textarea rows={5}
                        placeholder="What are you building? What problem does it solve? What's your timeline?"
                        value={form.message}
                        onChange={(e) => set("message")(e.target.value)}
                        onFocus={() => setFocusedMsg(true)}
                        onBlur={() => setFocusedMsg(false)}
                        required className={`${baseInput} resize-none`}
                        animate={{ borderColor: focusedMsg ? GOLD_BORDER : "rgba(255,255,255,0.07)" }}
                        style={{ boxShadow: focusedMsg ? `0 0 0 3px ${GOLD_SOFT}` : "none" } as any}
                      />
                      <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg, ${GOLD}, #e8c89a)` }}
                        animate={{ scaleX: focusedMsg ? 1 : 0, opacity: focusedMsg ? 1 : 0 }}
                        initial={{ scaleX: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
                    </div>
                  </div>

                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div key="error"
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-red-500/8 border border-red-500/20 rounded-xl px-5 py-4">
                        <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gold hairline divider */}
                  <div className="h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />

                  {/* Submit button — gold gradient */}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ y: -3, boxShadow: `0 16px 32px ${GOLD}25` }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "tween", duration: 0.15 }}
                    className="w-full relative overflow-hidden font-bold py-4 rounded-xl text-[0.9rem] tracking-wide disabled:opacity-70 disabled:cursor-not-allowed text-[#0e0d0c]"
                    style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)` }}>
                    {/* Shimmer */}
                    <motion.div className="absolute inset-0"
                      style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-3 relative z-10">
                          <motion.span animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="w-4 h-4 border-2 border-[#a07848] border-t-[#0e0d0c] rounded-full inline-block" />
                          Sending…
                        </motion.span>
                      ) : (
                        <motion.span key="idle"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 relative z-10">
                          Send Message <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <p className="text-center text-gray-800 text-xs pt-1">
                    Or{" "}
                    <a href={dynamicMailto}
                      className="transition-colors duration-200 underline underline-offset-2"
                      style={{ color: `${GOLD}60` }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = `${GOLD}60`)}>
                      email us directly at team@veltrex.co.in ↗
                    </a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ — gold accents ───────────────────────────────────────────────────────
function FAQSection() {
  const { ref, isInView } = useFadeIn();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-28 bg-[#050709] relative overflow-hidden">
      <ParallaxLayer speed={-0.08} className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full"
          style={{ background: `radial-gradient(ellipse 45% 40% at 50% 50%, ${GOLD_SOFT}, transparent)` }} />
      </ParallaxLayer>
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[340px_1fr] gap-16 items-start">

        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="lg:sticky lg:top-32">
          <motion.div variants={fadeUp}><SectionLabel>FAQ</SectionLabel></motion.div>
          <SplitHeading isInView={isInView} delay={0.05} tag="h2"
            className="text-[clamp(2rem,4vw,3rem)] font-black text-white leading-[1.05] tracking-[-0.025em] mb-5"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {"Common questions."}
          </SplitHeading>
          <motion.p variants={fadeUp} className="text-gray-600 text-sm leading-relaxed max-w-[260px]">
            Still not sure? Email us at{" "}
            <a href={buildMailto("Quick question about Veltrex.Devs",
              "Hi team,\n\nI have a quick question:\n\n[Your question here]\n\nThanks!")}
              className="transition-colors"
              style={{ color: GOLD }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              team@veltrex.co.in ↗
            </a>
          </motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div key={q} variants={fadeUp}
              className="bg-[#0a0c12] border border-white/[0.06] rounded-2xl overflow-hidden transition-colors duration-300"
              style={{ borderColor: openIdx === i ? GOLD_BORDER : undefined }}
              whileHover={{ borderColor: GOLD_BORDER } as any}>
              <button type="button" onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-7 py-5 text-left group">
                <span className="text-white text-[0.95rem] font-semibold pr-4 leading-snug">{q}</span>
                <motion.span
                  animate={{ rotate: openIdx === i ? 45 : 0, color: openIdx === i ? GOLD : "rgb(75,85,99)" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-shrink-0 text-xl leading-none transition-colors group-hover:text-[#c8a97e]">
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden">
                    <p className="px-7 pb-6 text-gray-500 text-sm leading-relaxed pt-4"
                      style={{ borderTop: `1px solid ${GOLD_BORDER}` }}>
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  return (
    <>
      <GrainOverlay />
      <ContactHero />
      <PromisesStrip />
      <ContactMain />
      <FAQSection />
    </>
  );
}