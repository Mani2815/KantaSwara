"use client";

import { motion, useInView } from "framer-motion";
import React, { RefObject } from "react";

interface TimelineContentProps {
  children: React.ReactNode;
  as?: "div" | "p" | "span" | "article" | "section";
  animationNum: number;
  timelineRef: RefObject<HTMLElement>;
  customVariants: any;
  className?: string;
}

export const TimelineContent = ({
  children,
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
}: TimelineContentProps) => {
  const isInView = useInView(timelineRef, { once: true, margin: "-50px" });
  const Component = motion[as as keyof typeof motion] as any;

  return (
    <Component
      variants={customVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      className={className}
    >
      {children}
    </Component>
  );
};
