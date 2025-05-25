// src/components/PlacesAutocompleteInput.jsx
import React, { useState, useEffect } from 'react';
import useOnclickOutside from 'react-cool-onclickoutside';
import { loadGoogleMapsScript } from '../utils/mapScriptLoader';

const PlacesAutocompleteInput = ({ onAddressSelect, initialValue = '' }) => {
  // State for tracking script loading
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('');
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  const ref = useOnclickOutside(() => {
    setSuggestions([]);
  });

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setMapsLoaded(true);
      if (window.google && window.google.maps && window.google.maps.places) {
        setAutocompleteService(new window.google.maps.places.AutocompleteService());
        setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
        setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
      }
    });
  }, []);

  // Update input value when initialValue prop changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 1 && autocompleteService && sessionToken) {
      autocompleteService.getPlacePredictions(
        {
          input: value,
          sessionToken: sessionToken
        },
        (predictions, serviceStatus) => {
          if (serviceStatus === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setStatus('OK');
          } else if (serviceStatus === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setSuggestions([]);
            setStatus('ZERO_RESULTS');
          } else {
            setSuggestions([]);
            setStatus('');
          }
        }
      );
    } else {
      setSuggestions([]);
      setStatus('');
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.description);
    setSuggestions([]);
    setStatus('');

    if (placesService && sessionToken) {
      placesService.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['geometry'],
          sessionToken: sessionToken
        },
        (place, detailsStatus) => {
          if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK) {
            // Generate a new session token for the next request
            setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
            
            if (onAddressSelect) {
              onAddressSelect({
                address: suggestion.description,
                latitude: place.geometry?.location.lat(),
                longitude: place.geometry?.location.lng(),
              });
            }
          }
        }
      );
    }
  };

  const renderSuggestions = () =>
    suggestions.map((suggestion) => (
      <li
        key={suggestion.place_id}
        onClick={() => handleSuggestionSelect(suggestion)}
        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div>
          <strong className="block text-sm font-medium text-gray-800">
            {suggestion.structured_formatting?.main_text || suggestion.description}
          </strong>
          <small className="block text-sm text-gray-500">
            {suggestion.structured_formatting?.secondary_text || ''}
          </small>
        </div>
      </li>
    ));

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={!mapsLoaded}
        placeholder={mapsLoaded ? "Start typing address..." : "Loading Maps API..."}
        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
        id="location-autocomplete"
      />
      {status === 'OK' && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {renderSuggestions()}
        </ul>
      )}
      {status === 'ZERO_RESULTS' && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg p-2 text-sm text-gray-500">
          No results found.
        </div>
      )}
    </div>
  );
};

export default PlacesAutocompleteInput;