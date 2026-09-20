import React from "react";
import { ExternalLink, Heart } from "lucide-react";

export const MinimalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="minimal-footer"
      className="w-full border-t border-border bg-card/80 backdrop-blur-md text-muted-foreground text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation links */}
        <nav aria-label="Legal and Support" className="order-2 sm:order-1">
          <ul className="flex flex-wrap items-center justify-center gap-4 font-medium">
            <li>
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </a>
            </li>
            <li>
              <a
                href="/status"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                System Status
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright & Creator Attribution */}
        <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-2">
          <span>&copy; {currentYear} EduAsas. All rights reserved.</span>
          <span className="hidden sm:inline text-border">•</span>
          <div className="inline-flex items-center gap-1 text-muted-foreground">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>by</span>
            <strong className="text-foreground font-semibold">Rollboy Services</strong>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
