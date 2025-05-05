//Frontend/src/utils/imagePreloader.js
import getFullImageUrl from '../utils/getFullImageUrl';
import { cityImageMap } from '../constants/cityImages';

export const preloadCityImages = (cities) => {
    cities.forEach(city => {
      const img = new Image();
      img.src = getFullImageUrl(city.imageUrl);
      // Also preload fallback image if exists
      if (cityImageMap[city.name]) {
        const fallbackImg = new Image();
        fallbackImg.src = cityImageMap[city.name];
      }
    });
};