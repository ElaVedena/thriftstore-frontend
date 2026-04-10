// components/common/KeepAlive.jsx - Working version
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Store rendered content globally
const pageCache = new Map();

export function KeepAlive({ children, cacheKey }) {
  const location = useLocation();
  const isActive = location.pathname === cacheKey;
  const containerRef = useRef(null);
  const hasRendered = useRef(false);

  // On first render, store the content
  useEffect(() => {
    if (!hasRendered.current && containerRef.current) {
      hasRendered.current = true;
      // Store initial content
      pageCache.set(cacheKey, {
        content: containerRef.current.innerHTML,
        scrollY: window.scrollY
      });
    }
  }, [cacheKey]);

  // When becoming active, restore content
  useEffect(() => {
    if (isActive && containerRef.current) {
      const cached = pageCache.get(cacheKey);
      if (cached && cached.content) {
        // Restore saved content
        containerRef.current.innerHTML = cached.content;
        // Restore scroll position
        setTimeout(() => {
          window.scrollTo(0, cached.scrollY || 0);
        }, 50);
      }
    }
  }, [isActive, cacheKey]);

  // When leaving, save current state
  useEffect(() => {
    if (!isActive && containerRef.current && containerRef.current.innerHTML) {
      pageCache.set(cacheKey, {
        content: containerRef.current.innerHTML,
        scrollY: window.scrollY
      });
    }
  }, [isActive, cacheKey]);

  // Always render, use display to show/hide
  return (
    <div 
      ref={containerRef}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}