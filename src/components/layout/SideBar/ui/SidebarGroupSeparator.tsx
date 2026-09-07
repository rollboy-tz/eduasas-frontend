"use client"
import { motion } from "framer-motion";
import { useSidebar } from "../useSidebar";

export const SidebarGroupSeparator = ({ title }: { title: string }) => {

const { size } = useSidebar()
  // Sasa hivi tunaonyesha maandishi TU ikiwa tuko Expanded
  const isExpanded = size === "expanded";

  return (
    <div className="relative flex items-center px-2 my-2 min-h-[1px] transition-all duration-300">
      {isExpanded ? (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center w-full gap-3"
        >
          {/* Maandishi ya Group (e.g., ACADEMICS) */}
          <span className="text-[9px] text-muted-500 font-medium select-none">{title}</span>

          
          {/* Mstari wa Kulia unaoziba nafasi iliyobaki */}
          {/* <div className="h-[1px] flex-1 bg-foreground/10" /> */}
        </motion.div>
      ) : (
        /* Hali ya Minimal (50px) - Mstari mmoja tu ulionyooka katikati */
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[1px] w-full bg-foreground/10 mx-auto" 
        />
      )}
    </div>
  );
};