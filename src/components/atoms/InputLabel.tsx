import { cn } from "@/lib/utils";

export interface InputLabelProps {
    required?: boolean;
    label: string;
    className?: string;
    htmlFor?: string;
}


export const InputLabel = ({ required = false, label, className, htmlFor = "text" }: InputLabelProps) => {
    return (
        <label htmlFor={htmlFor} className={cn("text-base lg:text-sm text-muted-600", className)}>
            {label}{required && <Required />}
        </label>
    )
}

const Required = () => (
    <span className="ml-1 text-red-500">*</span>
);