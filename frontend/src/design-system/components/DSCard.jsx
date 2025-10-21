import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function DSCard({ as: As = 'div', className, hover = true, children, ...props }) {
  return (
    <As
      className={cn(
        'relative rounded-2xl bg-card text-card-foreground border border-border shadow-sm',
        hover && 'ds-hover-raise',
        'p-6',
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}
