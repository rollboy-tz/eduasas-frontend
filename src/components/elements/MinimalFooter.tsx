import React from "react";
import { ExternalLink, Heart } from "lucide-react";

export const MinimalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full p-3 bg-white/90 border-t border-slate-100">
      <div className="flex flex-col md:flex-row justify-around w-full">

        {/* Sehemu ya Chini: Links ndogo, Copyright na Rollboy Services */}
          <div>
            <ul className="flex gap-3 text-blue-300 font-medium">
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
              <li>
                <a href="/status">System Status</a>
              </li>
            </ul>
          </div>

          <div>
            <p>&copy; {currentYear} EduAsas. All rights reserved.</p>
            <div>
              <span>Crafted with</span>
              <Heart />
              <span>by</span>
              <strong>Rollboy Services</strong>
              <ExternalLink />
            </div>
          </div>
        </div>
    </footer>
  );
};

export default MinimalFooter;