"use client";
import { motion } from "framer-motion";
import { useSidebar } from "../useSidebar";

export const SidebarGroupSeparator = ({ title }: { title: string }) => {
  const { size } = useSidebar();
  const isExpanded = size === "expanded";

  return (
    <div className="relative flex items-center px-3 my-2 min-h-[1px] transition-all duration-300">
      {isExpanded ? (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center w-full gap-3"
        >
          {/* Group Header Text */}
          <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider select-none">
            {title}
          </span>
        </motion.div>
      ) : (
        /* Minimal mode separator line */
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[1px] w-full bg-border mx-auto" 
        />
      )}
    </div>
  );
};

export default SidebarGroupSeparator;
