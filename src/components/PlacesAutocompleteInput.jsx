// src/components/PlacesAutocompleteInput.jsx
import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import useOnclickOutside from 'react-cool-onclickoutside';

const PlacesAutocompleteInput = ({ onAddressSelect, initialValue = '' }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: initialValue,
    requestOptions: {
      // Optional country restriction: componentRestrictions: { country: 'us' },
    },
    debounce: 300,
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  React.useEffect(() => {
    setValue(initialValue, false);
  }, [initialValue, setValue]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleSuggestionSelect = ({ description }) => async () => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);

      if (onAddressSelect) {
        onAddressSelect({
          address: description,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error('Error getting geocode:', error);
    }
  };

  const renderSuggestions = () =>
    data.map(({ place_id, structured_formatting: { main_text, secondary_text }, description }) => (
      <li
        key={place_id}
        onClick={handleSuggestionSelect({ description })}
        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div>
          <strong className="block text-sm font-medium text-gray-800">{main_text}</strong>
          <small className="block text-sm text-gray-500">{secondary_text}</small>
        </div>
      </li>
    ));

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={!ready}
        placeholder="Start typing address..."
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
