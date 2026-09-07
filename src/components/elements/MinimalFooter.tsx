import React from "react";
import { Sparkles, ExternalLink, Heart } from "lucide-react";

export const MinimalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div>
        {/* Sehemu ya Juu: AI Badge & Main Branding Statement */}
        <div>
          <div>
            <Sparkles />
            <span>Powered by Next-Gen AI & Distributed Architecture</span>
          </div>
          <p>
            EduAsas continuously adapts to your institution's workflow, delivering lightning-fast insights and seamless multi-tenant performance.
          </p>
        </div>

        {/* Sehemu ya Chini: Links ndogo, Copyright na Rollboy Services */}
        <div>
          <div>
            <ul>
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
      </div>
    </footer>
  );
};

export default MinimalFooter;