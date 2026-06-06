import { useEffect } from 'react';

export default function useAnimation(callback) {
  useEffect(() => {
    let rafId;
    function loop(t) {
      callback(t);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [callback]);
}
