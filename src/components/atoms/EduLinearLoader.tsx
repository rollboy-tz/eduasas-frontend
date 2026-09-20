"use client";

interface EduLinearLoaderProps {
  height?: number;
  color?: string; // e.g., "var(--primary)"
  glow?: boolean;
}

export function EduLinearLoader({ 
  height = 2, 
  color = "var(--primary)", 
  glow = true 
}: EduLinearLoaderProps) {
  return (
    <div className="relative w-full overflow-hidden bg-opacity-0 bg-inherit" style={{ height }}>
      
      {/* The Moving Gradient Line */}
      <div 
        className="animate-shimmer absolute inset-0 w-full h-full"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${color} 50%, 
            transparent 100%)`,
          boxShadow: glow ? `0 0 10px ${color}` : 'none'
        }}
      />

      {/* Optional: Static background line for better visibility */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10" 
        style={{ backgroundColor: color }}
      />
    </div>
  );
}