import { useState, useEffect } from 'react';

export default function useCollisions() {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    // placeholder: compute close-approach pairs
  }, []);

  return pairs;
}
