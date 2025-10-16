import React from 'react';

export default function DSContainer({ className = '', children }) {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl ${className}`}>
      {children}
    </div>
  );
}
