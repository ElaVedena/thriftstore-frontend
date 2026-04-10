// components/common/KeepAlive.jsx
import { useLocation } from 'react-router-dom';

const renderedPages = new Set();

export function KeepAlive({ children, cacheKey }) {
  const location = useLocation();
  const isActive = location.pathname === cacheKey;
  
  if (!renderedPages.has(cacheKey)) {
    renderedPages.add(cacheKey);
  }
  
  // Always render, just hide when not active
  // This keeps the component mounted in the DOM
  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      {children}
    </div>
  );
}