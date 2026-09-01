"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Splash({ onDone, sub, foot }: { onDone: () => void; sub?: string; foot?: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 700);
    }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden px-6 py-8 sm:px-8 supports-[height:100dvh]:h-[100dvh] h-[100svh] sm:h-auto sm:fixed sm:inset-0"
        >
          <div className="pointer-events-none absolute -left-10 top-1/3 h-48 w-48 rounded-full bg-[#2D4A22]/[0.07] blur-[40px] sm:-left-20 sm:h-72 sm:w-72 sm:blur-[60px]" />
          <div className="pointer-events-none absolute -right-10 bottom-1/4 h-48 w-48 rounded-full bg-[#8B6F47]/[0.08] blur-[40px] sm:-right-20 sm:h-72 sm:w-72 sm:blur-[60px]" />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex w-full max-w-[520px] flex-col items-center"
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-col items-center w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="NaturaFoods"
                className="h-12 w-auto max-w-[72vw] object-contain sm:h-14 sm:max-w-none md:h-[80px] lg:h-[100px] [@media(max-height:500px)]:h-10"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-3 sm:mt-4 max-w-[22ch] sm:max-w-none px-4 text-center text-[10px] leading-relaxed tracking-[0.22em] text-[#8B6F47] [text-wrap:balance] sm:text-[11px] sm:tracking-[0.35em] [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:text-[9px]"
            >
              {sub ?? "CHOCO & MATCHA DISTRIBUTION"}
            </motion.p>

            <div className="mt-8 h-px w-24 overflow-hidden bg-[#2D4A22]/15 sm:mt-10 sm:w-28 [@media(max-height:500px)]:mt-6">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
                className="h-full w-full bg-[#2D4A22]"
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 w-full max-w-[92vw] -translate-x-1/2 px-6 text-center text-[9px] leading-relaxed tracking-[0.16em] text-[#C4B5A0] [text-wrap:balance] sm:bottom-8 sm:max-w-none sm:px-0 sm:text-[10px] sm:tracking-[0.2em]"
          >
            {foot ?? "EST. 2019 — JAKARTA · TOKYO · MELBOURNE"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
