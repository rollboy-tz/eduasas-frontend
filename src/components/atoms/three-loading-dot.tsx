import { cn } from "@/lib/utils";

interface ThreeLoadingDotPeops {
    className?: string;
}

export const ThreeLoadingDot = ( { className }: ThreeLoadingDotPeops ) => {

    return (
        <span className={cn("inline-flex items-center space-x-0.3 font-semibold text-base", className)}>
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
    )

}