// components/LazyImage.jsx
import { useState, useEffect } from 'react';

const LazyImage = ({ src, alt, fallbackSrc, className, onError }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      if (fallbackSrc) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        };
        fallbackImg.onerror = () => {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        };
        fallbackImg.src = fallbackSrc;
      } else {
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };
    img.src = src;
  }, [src, fallbackSrc, onError]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`}>
        {/* Loading indicator */}
      </div>
    );
  }

  if (hasError) {
    return <div className={`${className} bg-gray-300 flex items-center justify-center`}>
      <span className="text-gray-600">Image unavailable</span>
    </div>;
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

export default LazyImage;