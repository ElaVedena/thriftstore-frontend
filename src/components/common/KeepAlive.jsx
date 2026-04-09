// components/common/KeepAlive.jsx
import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Global cache store
const componentCache = new Map();

export function KeepAlive({ children, cacheKey }) {
  const [show, setShow] = useState(true);
  const location = useLocation();
  const containerRef = useRef(null);

  // Save to cache when component unmounts
  useEffect(() => {
    return () => {
      if (containerRef.current && children) {
        // Save the DOM content
        componentCache.set(cacheKey, {
          content: containerRef.current.innerHTML,
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        });
      }
    };
  }, [cacheKey, children]);

  // Restore from cache when component mounts
  useEffect(() => {
    const cached = componentCache.get(cacheKey);
    if (cached && cached.content && containerRef.current) {
      containerRef.current.innerHTML = cached.content;
      setShow(false);
      // Restore scroll position
      setTimeout(() => {
        window.scrollTo(0, cached.scrollPosition || 0);
      }, 100);
    }
  }, [cacheKey]);

  // Clear cache when component is unmounted from DOM
  useEffect(() => {
    return () => {
      // Don't clear immediately, keep in cache
    };
  }, []);

  if (!show && componentCache.has(cacheKey)) {
    return <div ref={containerRef} />;
  }

  return <div ref={containerRef}>{children}</div>;
}