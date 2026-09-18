import { useEffect, useState } from "react";
import api from "../api/client";

let cachedStateCities = null;
let fetchPromise = null;

export function useLocations() {
  const [stateCities, setStateCities] = useState(cachedStateCities || []);
  const [loading, setLoading] = useState(!cachedStateCities);

  useEffect(() => {
    let isMounted = true;

    if (cachedStateCities) {
      setStateCities(cachedStateCities);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = api
        .get("/locations/state-cities")
        .then((res) => {
          const list = res.data?.data || [];
          cachedStateCities = list;
          return list;
        })
        .catch((err) => {
          console.error("Failed to load statecities:", err);
          return [];
        });
    }

    fetchPromise.then((data) => {
      if (isMounted) {
        setStateCities(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getCitiesForState = (stateName) => {
    if (!stateName) return [];
    const normalized = stateName.toLowerCase().trim();
    const match = stateCities.find(
      (item) =>
        item.state.toLowerCase().trim() === normalized ||
        (item.state_key && item.state_key.toLowerCase().trim() === normalized)
    );
    return match ? match.cities || [] : [];
  };

  const states = stateCities.map((item) => ({
    state: item.state,
    state_key: item.state_key || "",
    total_cities: item.cities ? item.cities.length : 0,
  }));

  return {
    stateCities,
    states,
    getCitiesForState,
    loading,
  };
}
