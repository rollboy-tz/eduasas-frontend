import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info";
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "info", title, children, ...props }, ref) => {
    // Mtindo maalum wa rangi kwa ajili ya Light Mode safi
    const variants = {
      success: "bg-emerald-50 border-emerald-200 text-emerald-900",
      warning: "bg-amber-50 border-amber-200 text-amber-900",
      error: "bg-red-50 border-red-200 text-red-900",
      info: "bg-blue-50 border-blue-200 text-blue-900",
    };

    // Icons za kisasa kupitia Lucide
    const icons = {
      success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
      warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
      error: <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />,
      info: <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`flex gap-3 rounded-xl border p-4 shadow-xs transition-all ${variants[variant]} ${className}`}
        {...props}
      >
        {icons[variant]}
        <div className="space-y-1 text-sm flex-1">
          {title && <h5 className="font-semibold tracking-tight">{title}</h5>}
          <div className="opacity-90 leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";