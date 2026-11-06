"use client";
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { useEffect } from "react";

export default function Count({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => String(Math.round(v)));
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const c = animate(mv, value, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    return c.stop;
  }, [value, mv, reduce]);
  return <motion.span className="nums">{text}</motion.span>;
}
