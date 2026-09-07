/**
 * @fileoverview SmartSticky Component - Enterprise Edition
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.1.0
 */

import {
    useEffect,
    useRef,
    useState,
} from "react";

/**
 * Properties for the SmartSticky component.
 */
export interface SmartStickyProps {
    /** 
     * Render prop function that provides the current sticky state. 
     * @param {boolean} stuck - True if the element is currently stuck to the header.
     */
    children: (stuck: boolean) => React.ReactNode;

    /** Optional callback fired whenever the sticky state changes. */
    onStickyChange?: (stuck: boolean) => void;

    /** Additional custom Tailwind CSS classes for the sticky container. */
    className?: string;
}

/**
 * @component SmartSticky
 * @description 
 * An advanced, high-performance sticky component that automatically detects 
 * when it hits a fixed application header, dynamically applying glassmorphism 
 * effects, shadows, and notifying parent components via render props.
 * 
 * @example
 * ```tsx
 * <SmartSticky>
 *   {(stuck) => (
 *     <div className="p-4 flex justify-between items-center">
 *       <h1 className="text-lg font-bold">School Dashboard</h1>
 *       {stuck && <QuickActionToolbar/>}
 *     </div>
 *   )}
 * </SmartSticky>
 * ```
 */
export default function SmartSticky({
    children,
    onStickyChange,
    className = "",
}: SmartStickyProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        let observer: IntersectionObserver | null = null;

        const setupObserver = () => {
            // Tafuta header ya app ili kupata urefu wake halisi
            const header = document.querySelector("[data-app-header]");
            const headerHeight = header ? header.getBoundingClientRect().height : 0;

            // Weka urefu kwenye CSS variable kwa matumizi ya baadaye
            document.documentElement.style.setProperty("--app-header-height", `${headerHeight}px`);

            // Disconnect observer ya zamani kama ipo kabla ya kuanzisha mpya
            if (observer) observer.disconnect();

            // Sanidi IntersectionObserver ikiwa na rootMargin inayozingatia urefu wa Header
            observer = new IntersectionObserver(
                ([entry]) => {
                    const isStuck = !entry.isIntersecting;
                    setStuck(isStuck);
                    onStickyChange?.(isStuck);
                },
                {
                    // Hapa ndipo uchawi ulipo: Inasubiri hadi ifikie chini ya header halisi
                    rootMargin: `-${headerHeight}px 0px 0px 0px`,
                    threshold: 0,
                }
            );

            observer.observe(trigger);
        };

        setupObserver();

        // Sikiliza mabadiliko ya ukubwa wa dirisha ili kurekebisha hesabu za header
        const handleResize = () => {
            setupObserver();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [onStickyChange]);

    return (
        <>
            {/* Sentinel trigger element to accurately track scroll position without layout shifts */}
            <div 
                ref={triggerRef} 
                className="h-px w-full -mt-px pointer-events-none" 
                aria-hidden="true" 
            />

            <div
                className={`
                    sticky
                    z-30
                    transition-all
                    duration-300
                    ease-in-out
                    ${
                        stuck
                            ? `
                              bg-white/80
                              dark:bg-gray-900/80
                              backdrop-blur-xl
                              shadow-sm
                              border-b
                              border-black/5
                              dark:border-white/10
                              `
                            : `
                              bg-transparent
                              border-transparent
                              shadow-none
                              `
                    }
                    ${className}
                `}
                style={{
                    top: "var(--app-header-height, 0px)",
                }}
            >
                {children(stuck)}
            </div>
        </>
    );
}