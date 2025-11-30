import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const base =
  'inline-flex items-center justify-center select-none whitespace-nowrap rounded font-medium ds-transition ds-focus-ring focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm px-4 py-2',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2',
  outline:
    'border border-border bg-transparent hover:bg-secondary text-foreground px-4 py-2',
  ghost:
    'bg-transparent hover:bg-secondary text-foreground px-3 py-2',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline px-0 py-0',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export default function DSButton({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  fullWidth,
  children,
  ...props
}) {
  return (
    <As
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leftIcon ? <span className="mr-2 -ml-1" aria-hidden>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="ml-2 -mr-1" aria-hidden>{rightIcon}</span> : null}
    </As>
  );
}
