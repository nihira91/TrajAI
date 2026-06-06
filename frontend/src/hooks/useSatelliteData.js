import { useState, useEffect } from 'react';

export default function useSatelliteData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // placeholder: load predictions.json or similar
  }, []);

  return data;
}
