'use client';

import { useLayoutEffect, useRef } from "react";
import { LeftHeaderContents } from "./LeftHeaderContents";
import { RightHeaderContents } from "./RightHeaderContents";

export const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // Calculate layout metrics for CSS custom variables
    const updateHeaderMetrics = () => {
      const computed = window.getComputedStyle(el);

      const height = el.offsetHeight;
      const width = el.offsetWidth;

      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;

      const marginTop = parseFloat(computed.marginTop) || 0;
      const marginBottom = parseFloat(computed.marginBottom) || 0;

      const totalOuterHeight = height + marginTop + marginBottom;

      const root = document.documentElement;
      root.style.setProperty("--header-height", `${height}px`);
      root.style.setProperty("--header-width", `${width}px`);
      root.style.setProperty("--header-padding-top", `${paddingTop}px`);
      root.style.setProperty("--header-padding-bottom", `${paddingBottom}px`);
      root.style.setProperty("--header-margin-top", `${marginTop}px`);
      root.style.setProperty("--header-margin-bottom", `${marginBottom}px`);
      root.style.setProperty("--header-total-outer-height", `${totalOuterHeight}px`);
    };

    const observer = new ResizeObserver(() => {
      updateHeaderMetrics();
    });

    observer.observe(el);
    window.addEventListener("resize", updateHeaderMetrics);

    updateHeaderMetrics();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderMetrics);
    };
  }, []);

  return (
    <header ref={headerRef} className="w-full header sticky top-0 z-40 shrink-0 md:bg-transparent">
      <div className="w-full bg-card/90 backdrop-blur-md border-b border-border/50 flex items-center justify-between shadow-xs py-2 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Left header contents: Navigation toggle & page title */}
        <LeftHeaderContents />

        {/* Right header contents: Search, Theme Toggle, Profile */}
        <RightHeaderContents />
      </div>
    </header>
  );
};

export default Header;
