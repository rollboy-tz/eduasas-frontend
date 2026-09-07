"use client";
import { capitalize } from "@/lib/utils/string-utils";

interface EduMainLoaderProps {
  size?: number;          // Sasa inapokea number pekee
  color?: string;         // Unaweza kupitisha "white", "black", au "var(--primary)"
  loadingText?: string;   // Optional: Ukiiacha wazi, maandishi hayatokei
}


/**
 * EduSas Main Loader
 * ------------------
 * @param size - Sasa inapokea number pekee
 * @param color - Unaweza kupitisha "white", "black", au "var(--primary)"
 * @param loadingText - Optional: Ukiiacha wazi, maandishi hayatokei
 */

export function EduMainLoader({
  size = 30,
  color = "#0066FF",
  loadingText
}: EduMainLoaderProps) {

  //hometaine text size accoding to loader size
  let textSize = "";
  if (size < 20) {
    textSize = "text-[10px]";
  } else if (size < 30) {
    textSize = "text-[11px]";
  } else {
    textSize = "text-[12px]";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">

      {/* THE SPINNER CONTAINER */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 50 50"
          className="animate-rotate h-full w-full"
        >
          {/* Ghost Path - Imekuwa Transparent kabisa sasa */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-0" // Imetoweka kabisa (Pure Transparent)
          />

          {/* The Morphing Arc (The Real Chrome Style) */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="5" // Nimeiongezea unene kidogo iwe "Safi"
            strokeLinecap="round"
            className="animate-dash"
          />
        </svg>
      </div>

      {/* MODERN ANIMATED DOTS TEXT */}
      {loadingText && (
        <div className="flex items-center gap-0.5 text-slate-600">
          <span className={`${textSize} font-semibold `}>
            {capitalize(loadingText)}
          </span>

          <span className="inline-flex items-center space-x-0.3 font-semibold text-base">
            <span
              className="animate-pulse"
              style={{ animationDuration: "1s", animationDelay: "0ms" }}
            >
              .
            </span>
            <span
              className="animate-pulse"
              style={{ animationDuration: "1s", animationDelay: "200ms" }}
            >
              .
            </span>
            <span
              className="animate-pulse"
              style={{ animationDuration: "1s", animationDelay: "400ms" }}
            >
              .
            </span>
          </span>
        </div>
      )}
    </div>
  );
}