import React from 'react';

export default function DSSection({ className = '', children, padded = true, id }) {
  return (
    <section id={id} className={`${padded ? 'py-10 sm:py-12 lg:py-16' : ''} ${className}`}>
      {children}
    </section>
  );
}
