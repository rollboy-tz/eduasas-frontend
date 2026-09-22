import { type ComponentType, type SVGProps } from 'react';

// 1. Ongeza 'size' kwenye type definition ya IconProps
export type CustomIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

// 2. Tumia CustomIconProps kwenye IconComponent
export type IconComponent = ComponentType<CustomIconProps>;

interface IconWrapperProps extends CustomIconProps {
  icon: IconComponent;
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = 18,
  className = '',
  ...props
}: IconWrapperProps) {
  if (!IconComponent) return null;

  // Hapa tunapitisha 'size' salama bila TypeScript kutoa error
  return (
    <IconComponent
      size={size}
      className={className}
      {...props}
    />
  );
}