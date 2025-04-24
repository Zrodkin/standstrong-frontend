// src/components/PlacesAutocompleteInput.jsx
import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import useOnclickOutside from 'react-cool-onclickoutside';

// This component receives a function `onAddressSelect` as a prop
// It will call this function when an address is chosen, passing the details back
const PlacesAutocompleteInput = ({ onAddressSelect, initialValue = '' }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    // Set the initial value when the component mounts (useful for edit mode)
    defaultValue: initialValue,
    requestOptions: {
      // You can add options here, e.g., restrict search to a country
      // componentRestrictions: { country: 'us' },
    },
    debounce: 300,
  });

  // Hook to handle clicking outside the suggestions list
  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  // Update internal state and parent component's value if needed (e.g., for edit forms)
  React.useEffect(() => {
    setValue(initialValue, false);
  }, [initialValue, setValue]);


  const handleInputChange = (e) => {
    setValue(e.target.value);
    // If the input changes, we might want to clear any previously selected detailed data
    // by calling onAddressSelect with partial data or null
    if (onAddressSelect) {
       onAddressSelect({ address: e.target.value, latitude: '', longitude: '' });
    }
  };

  const handleSuggestionSelect = ({ description }) => () => {
    setValue(description, false);
    clearSuggestions();

    getGeocode({ address: description })
      .then((results) => {
        const { lat, lng } = getLatLng(results[0]);
        console.log('📍 Geocode Results: ', results[0]);
        console.log('📍 Coordinates: ', { lat, lng });

        // Pass selected data back to the parent form component
        if (onAddressSelect) {
          onAddressSelect({
            address: description,
            latitude: lat,
            longitude: lng,
            // You could add more details from results[0].address_components here
          });
        }
      })
      .catch((error) => {
        console.error('😱 Error getting geocode: ', error);
      });
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSuggestionSelect(suggestion)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          <strong>{main_text}</strong> <small className="ml-1 text-gray-500">{secondary_text}</small>
        </li>
      );
    });

  return (
    // Use 'relative' positioning to contain the absolute suggestions list
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={!ready}
        placeholder="Start typing address..."
        // Use the same styling as your other inputs
        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
        id="location-autocomplete"
      />
      {/* Suggestions List */}
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