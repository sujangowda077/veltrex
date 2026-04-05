"use client";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cubicBezier } from "framer-motion";
import {
  faEnvelope, faMapMarkerAlt, faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";

// ─── Gold design tokens ───────────────────────────────────────────────────────
const GOLD        = "#c8a97e";
const GOLD_DIM    = "rgba(200,169,126,0.5)";
const GOLD_SOFT   = "rgba(200,169,126,0.08)";
const GOLD_BORDER = "rgba(200,169,126,0.25)";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.16, 1, 0.3, 1), // ✅ FIX
    },
  },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const footerLinks = {
  Services: [
    { label: "App Development", href: "/services" },
    { label: "Web Development", href: "/services" },
    { label: "AI Solutions", href: "/services" },
    { label: "SaaS Products", href: "/services" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  { icon: faGithub,   label: "GitHub",   href: "#" },
  { icon: faLinkedin, label: "LinkedIn", href: "#" },
];

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <footer className="bg-[#030407] relative overflow-hidden" ref={ref}>
      {/* Top gold hairline */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0, originX: "left" }} animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />

      {/* Gold ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD_SOFT} 0%, transparent 70%)` }} />

      {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
        className="max-w-[1180px] mx-auto px-6 pt-20 pb-12 grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12">

        {/* Brand column */}
        <motion.div variants={fadeUp} className="space-y-7">
          <Link href="/" className="flex items-center gap-3 group w-fit">
  <motion.div
    className="w-9 h-9 rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0 bg-black border"
    style={{ borderColor: "rgba(200,169,126,0.25)" }}
    whileHover={{ scale: 1.08 }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
  >

    {/* Glow effect */}
    <motion.div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at center, rgba(200,169,126,0.15), transparent 70%)",
      }}
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />

    {/* ✅ YOUR LOGO */}
    <Image
      src={logo}
      alt="Veltrex Logo"
      width={26}
      height={26}
      className="relative z-10 object-contain"
      priority
    />

  </motion.div>
            <motion.div className="leading-none" whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <span className="text-[1.05rem] font-black tracking-[-0.04em] text-white"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                VELTREX
              </span>
              <span className="text-[1.05rem] font-black tracking-[-0.04em]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8c89a 50%, #a07848 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                }}>
                {""}.DEVS
              </span>
            </motion.div>
          </Link>

          {/* Tagline */}
          <p className="text-gray-600 text-sm leading-relaxed max-w-[220px]">
            We build apps, websites, and AI products that solve real problems.
          </p>

          {/* Contact pills — both gold */}
          <div className="space-y-2.5">
            {[
              { icon: faEnvelope,     value: "team@veltrex.co.in", href: "mailto:team@veltrex.co.in" },
              { icon: faMapMarkerAlt, value: "Bengaluru, India",       href: "#" },
            ].map(({ icon, value, href }) => (
              <motion.a key={value} href={href}
                whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex items-center gap-2.5 group w-fit">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
                  <FontAwesomeIcon icon={icon} className="text-[9px]" style={{ color: GOLD }} />
                </div>
                <span className="text-gray-600 text-xs hover:text-gray-400 transition-colors duration-200">{value}</span>
              </motion.a>
            ))}
          </div>

          {/* Social icons — gold hover */}
          <div className="flex gap-2.5">
            {socials.map(({ icon, label, href }) => (
              <motion.a key={label} href={href} aria-label={label}
                whileHover={{ y: -3, color: GOLD, borderColor: GOLD_BORDER }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-8 h-8 rounded-lg border border-white/[0.07] flex items-center justify-center text-gray-700 transition-colors duration-200">
                <FontAwesomeIcon icon={icon} className="text-xs" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <motion.div key={section} variants={fadeUp}>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-6"
              style={{ color: `${GOLD}60` }}>
              {section}
            </div>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <motion.li key={label}
                  whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                  <Link href={href}
                    className="text-gray-700 text-sm transition-colors duration-200 flex items-center gap-1.5 group w-fit"
                    style={{}}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                    {label}
                    <motion.span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px]">
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ color: GOLD }} />
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-[1180px] mx-auto px-6 pb-10">
        {/* Gold animated divider */}
        <motion.div className="h-px mb-8"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
          initial={{ scaleX: 0, originX: "left" }} animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-800 text-xs">
            © {new Date().getFullYear()} Veltrex.DEVS. All rights reserved.
          </p>

          {/* Availability badge — full gold */}
          <motion.div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ border: `1px solid ${GOLD_BORDER}`, background: GOLD_SOFT }}
            whileHover={{ borderColor: `${GOLD}50`, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: `${GOLD}80` }}>
              Building new projects
            </span>
          </motion.div>

          <p className="text-gray-900 text-xs">Crafted in Bengaluru, India</p>
        </div>
      </motion.div>

      {/* Bottom gold hairline */}
      <motion.div className="absolute bottom-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }}
        initial={{ scaleX: 0, originX: "left" }} animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
    </footer>
  );
}
