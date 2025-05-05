// components/CityImage.jsx
import { useState, useEffect } from 'react';
import getFullImageUrl from '../utils/getFullImageUrl';

const CityImage = ({ city, cityImageMap, defaultCityImage, className }) => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    src: null
  });

  useEffect(() => {
    let mounted = true;
    const imageUrl = getFullImageUrl(city.imageUrl);
    
    const img = new Image();
    img.onload = () => {
      if (mounted) {
        setImageState({ loading: false, error: false, src: imageUrl });
      }
    };
    img.onerror = () => {
      if (mounted) {
        const fallbackSrc = cityImageMap[city.name] || defaultCityImage;
        setImageState({ loading: false, error: true, src: fallbackSrc });
      }
    };
    img.src = imageUrl;

    return () => {
      mounted = false;
    };
  }, [city, cityImageMap, defaultCityImage]);

  if (imageState.loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageState.src}
      alt={`${city.name} skyline`}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  );
};

export default CityImage;