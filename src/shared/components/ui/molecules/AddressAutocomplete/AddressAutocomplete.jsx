import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import TextField from "../../atoms/TextField/TextField.jsx";
import "./AddressAutocomplete.scss";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export default function AddressAutocomplete({
  value = "",
  onSelect,
  onTextChange,
  placeholder = "Escribe una dirección…",
  invalid = false,
  className = "",
}) {
  const classes = [
    "address-autocomplete",
    invalid ? "address-autocomplete--invalid" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handlePlaceSelect(feature) {
    if (!feature?.properties) return;
    onSelect?.({
      formatted: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
    });
  }

  function handleUserInput(text) {
    onTextChange?.(text);
  }

  if (!GEOAPIFY_API_KEY) {
    return (
      <TextField
        className={className}
        invalid={invalid}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onTextChange?.(e.target.value)}
      />
    );
  }

  return (
    <div className={classes}>
      <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
        <GeoapifyGeocoderAutocomplete
          placeholder={placeholder}
          value={value}
          placeSelect={handlePlaceSelect}
          onUserInput={handleUserInput}
          filterByCountryCode={["es"]}
          debounceDelay={300}
        />
      </GeoapifyContext>
    </div>
  );
}