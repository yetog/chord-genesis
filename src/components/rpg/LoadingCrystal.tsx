import React from 'react';

interface LoadingCrystalProps {
  message?: string;
}

export default function LoadingCrystal({ message = 'Generating...' }: LoadingCrystalProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      {/* Crystal Animation */}
      <div className="loading-crystal mb-6" aria-hidden="true" />

      {/* Loading Text */}
      <p className="text-purple-200 text-lg font-medium text-glow animate-pulse">
        {message}
      </p>

      {/* Materia dots */}
      <div className="flex gap-2 mt-4" aria-hidden="true">
        <div className="materia-indicator" style={{ animationDelay: '0s' }} />
        <div className="materia-indicator" style={{ animationDelay: '0.3s' }} />
        <div className="materia-indicator" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Generating chord progression, please wait...</span>
    </div>
  );
}
