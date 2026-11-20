import { useState } from 'react';
import { Coffee } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#EFECE6] text-[#5C574F] border border-[#DDD8CE] p-6 text-center ${className}`}
      >
        <Coffee className="w-8 h-8 mb-3 stroke-[1.5] text-[#1F3A2E]" aria-hidden="true" />
        <span className="font-display text-lg text-[#191715]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
