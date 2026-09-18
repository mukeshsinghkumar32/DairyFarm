import { useState } from "react";
import { useLocations } from "../../hooks/useLocations";

export default function StateCitySelect({
  selectedState = "",
  selectedCity = "",
  onStateChange,
  onCityChange,
  stateLabel = "State *",
  cityLabel = "City *",
  stateName = "state",
  cityName = "city",
  stateClassName = "",
  cityClassName = "",
  stateWrapClassName = "state-select-wrap",
  cityWrapClassName = "city-select-wrap",
  labelClassName = "form-label",
  required = false,
  disabled = false,
  showCustomCityInput = true,
}) {
  const { states, getCitiesForState, loading } = useLocations();
  const [manualCity, setManualCity] = useState(false);

  const availableCities = getCitiesForState(selectedState);
  const isSelectedCityInList =
    !selectedCity || availableCities.includes(selectedCity);

  const handleStateSelect = (e) => {
    const newState = e.target.value;
    setManualCity(false);
    if (onStateChange) onStateChange(newState);
    // Reset city when state changes
    if (onCityChange) onCityChange("");
  };

  const handleCitySelect = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setManualCity(true);
      if (onCityChange) onCityChange("");
    } else {
      setManualCity(false);
      if (onCityChange) onCityChange(val);
    }
  };

  return (
    <>
      {/* State Dropdown */}
      <div className={stateWrapClassName}>
        {stateLabel && <label className={labelClassName}>{stateLabel}</label>}
        <select
          name={stateName}
          className={stateClassName}
          value={selectedState}
          onChange={handleStateSelect}
          required={required}
          disabled={disabled || loading}
        >
          <option value="">
            {loading ? "Loading states..." : "Select State"}
          </option>
          {states.map((st) => (
            <option key={st.state} value={st.state}>
              {st.state} {st.state_key ? `(${st.state_key})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown or Custom Input */}
      <div className={cityWrapClassName}>
        {cityLabel && <label className={labelClassName}>{cityLabel}</label>}
        {manualCity ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              name={cityName}
              className={cityClassName}
              placeholder="Enter city / district name"
              value={selectedCity}
              onChange={(e) => onCityChange && onCityChange(e.target.value)}
              required={required}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setManualCity(false);
                if (onCityChange) onCityChange("");
              }}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              title="Back to dropdown list"
            >
              ↩ List
            </button>
          </div>
        ) : (
          <select
            name={cityName}
            className={cityClassName}
            value={selectedCity}
            onChange={handleCitySelect}
            required={required}
            disabled={disabled || !selectedState}
          >
            <option value="">
              {!selectedState
                ? "Select City (Select State First)"
                : availableCities.length === 0
                ? "No cities listed (type manually)"
                : `Select City in ${selectedState}`}
            </option>

            {/* If selected city is saved from DB but not in standard list, display it */}
            {selectedState && !isSelectedCityInList && selectedCity && (
              <option value={selectedCity}>
                {selectedCity}
              </option>
            )}

            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}

            {showCustomCityInput && selectedState && (
              <option value="__custom__">➕ Other / Enter city manually</option>
            )}
          </select>
        )}
      </div>
    </>
  );
}

