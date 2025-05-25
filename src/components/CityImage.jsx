// src/components/CityImage.jsx
import { useState, useEffect, useRef } from 'react';
import getFullImageUrl from '../utils/getFullImageUrl';
import { loadSingleImage } from '../utils/imagePreloader';

const CityImage = ({ city, cityImageMap, defaultCityImage, className }) => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    src: null,
    placeholder: null,
    blurUp: true
  });

  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const loadStartedRef = useRef(false);

  useEffect(() => {
    // Clean up observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    loadStartedRef.current = false;

    // Function to start loading the image when visible
    const startLoading = () => {
      if (loadStartedRef.current) return;
      loadStartedRef.current = true;

      // First, try to generate/load a tiny placeholder version
      // In a full implementation, you'd have true thumbnails from the server
      const thumbnailUrl = getFullImageUrl(city.imageUrl, 'thumbnail');

      // Load the thumbnail first (very quickly)
      loadSingleImage(thumbnailUrl, 5, (url, success) => {
        if (!mounted) return;
        if (success) {
          setImageState(prev => ({
            ...prev,
            placeholder: url
          }));
        }

        // Then load the full-sized image
        const fullImageUrl = getFullImageUrl(city.imageUrl);
        loadSingleImage(fullImageUrl, 0, (url, success) => {
          if (!mounted) return;

          if (success) {
            setImageState({
              loading: false,
              error: false,
              src: url,
              placeholder: prev => prev.placeholder,
              blurUp: false
            });
          } else {
            // Try fallback image
            const fallbackSrc = cityImageMap[city.name] || defaultCityImage;
            setImageState({
              loading: false,
              error: true,
              src: fallbackSrc,
              placeholder: prev => prev.placeholder,
              blurUp: false
            });
          }
        });
      });
    };

    // Set up Intersection Observer for visibility detection
    if (typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // If the element is visible, start loading the image
          if (entries[0].isIntersecting) {
            startLoading();
            // Once we've started loading, no need to observe anymore
            observerRef.current.disconnect();
          }
        },
        { threshold: 0.1 } // Start loading when 10% visible
      );

      if (elementRef.current) {
        observerRef.current.observe(elementRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      startLoading();
    }

    return () => {
      mounted = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [city, cityImageMap, defaultCityImage]);

  return (
    <div
      ref={elementRef}
      className={`${className} relative overflow-hidden bg-gray-200`}
    >
      {/* Loading spinner (shown only if no placeholder is available) */}
      {imageState.loading && !imageState.placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Placeholder image with blur effect */}
      {imageState.placeholder && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: imageState.blurUp ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          <img
            src={imageState.placeholder}
            alt=""
            className="w-full h-full object-cover filter blur-md scale-110"
          />
        </div>
      )}

      {/* Main image (shown when loaded) */}
      {imageState.src && (
        <img
          src={imageState.src}
          alt={`${city.name} skyline`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageState.loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => {
            setImageState(prev => ({
              ...prev,
              loading: false,
              blurUp: false
            }));
          }}
        />
      )}
    </div>
  );
};

export default CityImage;