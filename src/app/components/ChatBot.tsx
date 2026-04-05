"use client";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
// ChatBot.tsx — Fixed version
// Fixes:
//   ✅ Uses Groq API instead of Anthropic
//   ✅ oklab() color removed from whileHover (replaced with hex)
//   ✅ "transparent" not used in animate props (use rgba(x,x,x,0) instead)
//   ✅ Send button gradient animates correctly

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPaperPlane,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

type Role = "user" | "assistant";
interface Message { role: Role; content: string; }

const QUICK_REPLIES = [
  "What services do you offer?",
  "Tell me about your projects",
  "How long does a project take?",
  "How do I get started?",
];

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-600"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {/* Avatar — Vexa */}
{!isUser && (
  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 overflow-hidden border"
    style={{ borderColor: "rgba(200,169,126,0.25)" }}
  >
    <Image
      src={logo}
      alt="Veltrex AI"
      width={20}
      height={20}
      className="object-contain"
    />
  </div>
)}
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-[1.7] ${
          isUser
            ? "bg-white text-zinc-950 font-medium rounded-br-sm"
            : "bg-[#0f1117] border border-white/[0.06] text-gray-300 font-light rounded-bl-sm"
        }`}
        style={{ wordBreak: "break-word" }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Main ChatBot ─────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Vexa, your guide to Veltrex.Devs 👋 I can help with services, projects, timelines, or getting started. What are you building?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "Something went wrong. Please email team@veltrex.co.in",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Please email team@veltrex.co.in — we respond within 4 hours.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const hasInput = input.trim().length > 0;

  return (
    <>
            {/* ─── Floating button ───────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[950]">
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #c8a97e 100%)",
                boxShadow: "0 8px 32px #c8a97e",
              }}
              whileHover={{ scale: 1.08, boxShadow: "0 12px 40px #c8a97e" }}
              whileTap={{ scale: 0.94 }}
              aria-label="Open chat"
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-[#c8a97e]/50"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />

              {/* Icon — chat bubble SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative z-10">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  fill="rgba(5,7,9,0.85)" stroke="rgba(5,7,9,0.4)" strokeWidth="0.5" />
              </svg>

              {/* Unread dot */}
              {hasUnread && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#050709] flex-shrink-0"
                  style={{ boxShadow: "0 0 8px rgba(52,211,153,0.9)" }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Chat window ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[950] w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-3xl overflow-hidden"
            style={{
              height: "min(600px, calc(100vh - 100px))",
              background: "#07090f",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,255,0.04)",
            }}
          >
            {/* Grain */}
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.02]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative flex-shrink-0 px-5 py-4 border-b border-white/[0.06]">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,245,255,0.04), rgba(0,0,0,0))" }} />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
    className="absolute w-9 h-9 rounded-full pointer-events-none"
    style={{
      background:
        "radial-gradient(circle at center, rgba(200,169,126,0.15), transparent 70%)",
    }}
  />

  {/* Logo */}
  <Image
    src={logo}
    alt="Veltrex"
    width={26}
    height={26}
    className="relative z-10 object-contain"
  />
                    {/* Online dot — ✅ no oklab, no transparent in animate */}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#07090f]"
                      style={{ background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.9)" }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold leading-tight"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      Vexa
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: "#6ee7b7" }}>
                      Online · Veltrex AI Guide
                    </div>
                  </div>
                </div>

                {/* Close */}
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  aria-label="Close chat"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors duration-200"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </motion.button>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-5" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} index={i} />
              ))}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 mb-3"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border bg-black"
  style={{
    borderColor: "rgba(200,169,126,0.25)",
    boxShadow: "0 0 6px rgba(200,169,126,0.25)"
  }}
>

  {/* Glow */}
  <div
    className="absolute w-6 h-6 rounded-full pointer-events-none"
    style={{
      background:
        "radial-gradient(circle at center, rgba(200,169,126,0.15), transparent 70%)",
    }}
  />

  {/* Logo */}
  <Image
    src={logo}
    alt="Veltrex AI"
    width={18}
    height={18}
    className="relative z-10 object-contain"
  />
</div>
                    <div className="bg-[#0f1117] rounded-2xl rounded-bl-sm"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick replies ───────────────────────────────────────── */}
            {messages.length === 1 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="px-4 pb-3 flex flex-wrap gap-2"
              >
                {QUICK_REPLIES.map((qr) => (
                  <motion.button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-[11px] px-3 py-1.5 rounded-full text-left transition-colors duration-200"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    {qr}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* ── Input bar ──────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {/* Input */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Ask me anything…"
                    disabled={loading}
                    className="w-full rounded-2xl px-4 py-3 text-white text-[13px] focus:outline-none disabled:opacity-50 transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: inputFocused ? "1px solid #c8a97e" : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: inputFocused ? "0 0 0 3px rgba(0,245,255,0.06)" : "none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
                    }}
                  />
                  {/* ✅ Focus underline — uses rgba(x,x,x,0) not "transparent" */}
                  <div
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full pointer-events-none transition-opacity duration-200"
                    style={{
                      background: "linear-gradient(90deg, ##c8a97e)",
                      opacity: hasInput ? 0.6 : 0,
                    }}
                  />
                </div>

                {/* Send button — ✅ no animated background color between oklab values */}
                <motion.button
                  type="submit"
                  disabled={loading || !hasInput}
                  whileHover={hasInput && !loading ? { scale: 1.08 } : {}}
                  whileTap={hasInput && !loading ? { scale: 0.94 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  aria-label="Send"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:opacity-30"
                  style={{
                    background: hasInput && !loading
                      ? "linear-gradient(135deg, #c8a97e)"
                      : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="w-3.5 h-3.5 rounded-full border-2 border-gray-600 border-t-gray-300"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      className={`text-[11px] ${hasInput ? "text-zinc-950" : "text-gray-600"}`}
                    />
                  )}
                </motion.button>
              </form>

              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
                  Powered by Groq AI
                </p>
                <a href="mailto:team@veltrex.co.in"
                  className="flex items-center gap-1 text-[10px] transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)"; }}>
                  Email us
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[8px]" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}