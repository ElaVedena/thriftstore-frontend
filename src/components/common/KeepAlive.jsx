 // components/common/KeepAlive.jsx
import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Global cache store - persists across all components
const componentCache = new Map();

export function KeepAlive({ children, cacheKey }) {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const location = useLocation();
  const containerRef = useRef(null);
  
  // Check if this is the currently active route
  const isActive = location.pathname === cacheKey;

  // Load from cache when component becomes active
  useEffect(() => {
    if (isActive) {
      const cached = componentCache.get(cacheKey);
      
      if (cached && !isFirstLoad) {
        // Restore from cache (only after first load)
        if (containerRef.current && cached.content) {
          containerRef.current.innerHTML = cached.content;
          
          // Restore scroll position
          setTimeout(() => {
            window.scrollTo(0, cached.scrollPosition || 0);
          }, 50);
        }
      }
      
      setIsFirstLoad(false);
    }
  }, [isActive, cacheKey, isFirstLoad]);

  // Save to cache when component becomes inactive
  useEffect(() => {
    return () => {
      if (containerRef.current && containerRef.current.innerHTML && !isActive && !isFirstLoad) {
        // Save current state to cache
        componentCache.set(cacheKey, {
          content: containerRef.current.innerHTML,
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        });
      }
    };
  }, [cacheKey, isActive, isFirstLoad]);

  // Always render the children, but use CSS to show/hide instead of unmounting
  return (
    <div 
      ref={containerRef}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}                                          