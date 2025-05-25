// src/utils/mapScriptLoader.js
export const loadGoogleMapsScript = (callback) => {
    // Check if script is already loaded
    const existingScript = document.getElementById('googleMapsScript');
    const isGoogleMapsLoaded = window.google && window.google.maps && window.google.maps.places;
    
    if (isGoogleMapsLoaded) {
      // If API is already loaded, just call the callback
      if (callback) callback();
      return;
    }
    
    if (!existingScript) {
      // If script tag doesn't exist, create and append it
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.id = 'googleMapsScript';
      script.async = true;
      script.defer = true;
      
      // Set up callback for when script loads
      script.onload = () => {
        if (callback) callback();
      };
      
      document.body.appendChild(script);
    } else {
      // Script tag exists but API not loaded yet, set up a check
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMapsLoaded);
          if (callback) callback();
        }
      }, 100);
      
      // Set a timeout to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleMapsLoaded);
      }, 10000);
    }
  };