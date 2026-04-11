// components/common/KeepAlive.jsx
import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Global cache store
const componentCache = new Map();

export function KeepAlive({ children, cacheKey }) {
  const [cachedContent, setCachedContent] = useState(null);
  const location = useLocation();
  const containerRef = useRef(null);
  
  // Check if this is the currently active route
  const isActive = location.pathname === cacheKey;

  // Load from cache when component becomes active
  useEffect(() => {
    if (isActive) {
      const cached = componentCache.get(cacheKey);
      if (cached && cached.content && containerRef.current) {
        // Restore from cache
        containerRef.current.innerHTML = cached.content;
        setCachedContent(cached.content);
        
        // Restore scroll position
        setTimeout(() => {
          window.scrollTo(0, cached.scrollPosition || 0);
        }, 50);
      } else {
        // First time loading - render normally
        setCachedContent(null);
      }
    }
  }, [isActive, cacheKey]);

  // Save to cache when component becomes inactive
  useEffect(() => {
    return () => {
      if (containerRef.current && containerRef.current.innerHTML && !isActive) {
        // Save current state to cache
        componentCache.set(cacheKey, {
          content: containerRef.current.innerHTML,
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        });
      }
    };
  }, [cacheKey, isActive]);

  // If not active and we have cached content, render the cached version
  if (!isActive && componentCache.has(cacheKey)) {
    return (
      <div 
        ref={containerRef}
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: componentCache.get(cacheKey).content }}
      />
    );
  }

  // For active route or first load
  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}