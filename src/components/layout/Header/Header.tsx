'use client';

import { useLayoutEffect, useRef } from "react";
import { LeftHeaderContents } from "./LeftHeaderContents";
import { RightHeaderContents } from "./RightHeaderContents";

export const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // Function ya kupima vipimo vyote (Offset Height, Padding, na Margin)
    const updateHeaderMetrics = () => {
      const computed = window.getComputedStyle(el);

      // 1. Height & Width ya msingi
      const height = el.offsetHeight; // Kimo kamili ikijumuisha Border na Padding
      const width = el.offsetWidth;

      // 2. Kuchukua Padding (Top & Bottom)
      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;

      // 3. Kuchukua Margin (Top & Bottom)
      const marginTop = parseFloat(computed.marginTop) || 0;
      const marginBottom = parseFloat(computed.marginBottom) || 0;

      // 4. Total Outer Space (Urefu wote ambao Header inachukua kwenye layout)
      const totalOuterHeight = height + marginTop + marginBottom;

      // Kutuma vipimo vyote kwenye CSS Custom Variables
      const root = document.documentElement;
      root.style.setProperty("--header-height", `${height}px`);
      root.style.setProperty("--header-width", `${width}px`);
      root.style.setProperty("--header-padding-top", `${paddingTop}px`);
      root.style.setProperty("--header-padding-bottom", `${paddingBottom}px`);
      root.style.setProperty("--header-margin-top", `${marginTop}px`);
      root.style.setProperty("--header-margin-bottom", `${marginBottom}px`);

      // Variable kuu kwa ajili ya Sticky Offset
      root.style.setProperty("--header-total-outer-height", `${totalOuterHeight}px`);
    };

    // Observer ya kufuatilia mabadiliko ya ukubwa wa Header muda wote
    const observer = new ResizeObserver(() => {
      updateHeaderMetrics();
    });

    observer.observe(el);
    window.addEventListener("resize", updateHeaderMetrics);

    // Kufanya kipimo cha mwanzo kabisa
    updateHeaderMetrics();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderMetrics);
    };
  }, []);

  return (
    <header ref={headerRef} className="w-full header sticky top-0 z-40 shrink-0 md:px-none md:bg-tranparent">
      <div className="w-full bg-white md:bg-gray-50 flex items-center rounded-b-xl shadow-sm md:shadow-none py-2 px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Sehemu ya Kushoto: Mobile Menu Button & Dynamic Title */}
        <LeftHeaderContents />

        {/* Sehemu ya Kulia: Search, Badges, na Profile Panel */}
        <RightHeaderContents />
      </div>
    </header>
  );
};