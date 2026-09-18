import { motion } from "framer-motion";
import { ReactNode } from "react";

export function FloatingElement(props: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: props.duration || 6,
        delay: props.delay || 0,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={props.className}
    >
      {props.children}
    </motion.div>
  );
}
