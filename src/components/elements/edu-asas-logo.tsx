import { cn } from "@/lib/utils";

interface LogoProps {
    titleHiden?: boolean;
    imageHeight?: number;
    imageWidth?: number;
    eduClasses?: string;
    asasClasses?: string;
    className?: string;
    titleClasses?: string;
}

export const EduAsasLogo = (
    { 
        titleHiden = false, 
        imageHeight = 30, 
        imageWidth = 30, 
        titleClasses,
        className, 
        eduClasses, 
        asasClasses 
    }: LogoProps ) => {
    return (
        < div className={cn("flex items-center", className)}>
            <img
                src={'/icons/logo-256.png'}
                alt="EduAsas logo"
                width={imageWidth}
                height={imageHeight}
            />{
                !titleHiden && (
                    <div className={titleClasses}>
                        <span className={eduClasses}>Edu</span>
                        <span className={asasClasses}>Asas</span>
                    </div>
                )
            }
        </div>
    )
}