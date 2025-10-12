/**
 * Performance Optimization Utilities
 * 
 * Image lazy loading, code splitting, virtual scrolling, and Core Web Vitals monitoring
 * 
 * @module utils/performance
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Initialize performance monitoring
 * Tracks Core Web Vitals and sends to analytics
 */
export function initPerformanceMonitoring() {
  // Largest Contentful Paint (LCP)
  onLCP((metric) => {
    reportMetric('LCP', metric);
  });
  
  // First Input Delay (FID)
  onFID((metric) => {
    reportMetric('FID', metric);
  });
  
  // Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    reportMetric('CLS', metric);
  });
  
  // First Contentful Paint (FCP)
  onFCP((metric) => {
    reportMetric('FCP', metric);
  });
  
  // Time to First Byte (TTFB)
  onTTFB((metric) => {
    reportMetric('TTFB', metric);
  });
  
  console.log('[Performance] Monitoring initialized');
}

/**
 * Report performance metric to analytics
 * 
 * @param {string} name - Metric name
 * @param {Object} metric - Metric data
 */
function reportMetric(name, metric) {
  const { value, rating, delta } = metric;
  
  console.log(`[Performance] ${name}:`, {
    value: Math.round(value),
    rating,
    delta: Math.round(delta)
  });
  
  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    const data = JSON.stringify({
      metric: name,
      value: Math.round(value),
      rating,
      timestamp: Date.now(),
      url: window.location.pathname
    });
    
    navigator.sendBeacon('/api/analytics/metrics', data);
  }
}

/**
 * Lazy load images with Intersection Observer
 * 
 * @param {string} selector - CSS selector for images to lazy load
 * 
 * @example
 * // Add data-src attribute to images
 * <img data-src="image.jpg" class="lazy-load" alt="..." />
 * 
 * // Initialize lazy loading
 * lazyLoadImages('.lazy-load');
 */
export function lazyLoadImages(selector = '[data-src]') {
  const images = document.querySelectorAll(selector);
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy-load');
            img.classList.add('lazy-loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    console.log('[Performance] Lazy loading', images.length, 'images');
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }
}

/**
 * Preload critical images
 * 
 * @param {Array<string>} urls - Array of image URLs to preload
 * 
 * @example
 * preloadImages([
 *   '/icons/icon-192x192.png',
 *   '/images/hero.jpg'
 * ]);
 */
export function preloadImages(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
  
  console.log('[Performance] Preloading', urls.length, 'images');
}

/**
 * Debounce function execution
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   searchAPI(query);
 * }, 300);
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Virtual scrolling for large lists
 * Renders only visible items for better performance
 * 
 * @param {Object} options - Virtual scroll options
 * @returns {Object} Virtual scroll controller
 * 
 * @example
 * const virtualScroll = createVirtualScroll({
 *   container: document.getElementById('list'),
 *   items: allItems, // Array of all items
 *   itemHeight: 100, // Height of each item in pixels
 *   renderItem: (item, index) => {
 *     return `<div class="item">${item.name}</div>`;
 *   }
 * });
 */
export function createVirtualScroll(options) {
  const {
    container,
    items,
    itemHeight,
    renderItem,
    overscan = 3
  } = options;
  
  let scrollTop = 0;
  const containerHeight = container.clientHeight;
  const totalHeight = items.length * itemHeight;
  
  // Create scrollable wrapper
  const wrapper = document.createElement('div');
  wrapper.style.height = `${totalHeight}px`;
  wrapper.style.position = 'relative';
  
  // Create content container
  const content = document.createElement('div');
  content.style.position = 'absolute';
  content.style.top = '0';
  content.style.left = '0';
  content.style.right = '0';
  
  wrapper.appendChild(content);
  container.appendChild(wrapper);
  
  /**
   * Render visible items
   */
  function render() {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleItems = items.slice(startIndex, endIndex);
    
    content.style.transform = `translateY(${startIndex * itemHeight}px)`;
    content.innerHTML = visibleItems
      .map((item, i) => renderItem(item, startIndex + i))
      .join('');
  }
  
  /**
   * Handle scroll
   */
  const handleScroll = throttle(() => {
    scrollTop = container.scrollTop;
    render();
  }, 16); // ~60fps
  
  container.addEventListener('scroll', handleScroll);
  
  // Initial render
  render();
  
  return {
    /**
     * Update items and re-render
     */
    update(newItems) {
      items.length = 0;
      items.push(...newItems);
      wrapper.style.height = `${newItems.length * itemHeight}px`;
      render();
    },
    
    /**
     * Scroll to specific index
     */
    scrollToIndex(index) {
      container.scrollTop = index * itemHeight;
    },
    
    /**
     * Destroy virtual scroll
     */
    destroy() {
      container.removeEventListener('scroll', handleScroll);
      wrapper.remove();
    }
  };
}

/**
 * Optimize images with Cloudinary transformations
 * 
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 * 
 * @example
 * const optimized = optimizeCloudinaryImage(originalUrl, {
 *   width: 400,
 *   height: 400,
 *   format: 'auto',
 *   quality: 'auto'
 * });
 */
export function optimizeCloudinaryImage(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  const {
    width,
    height,
    crop = 'fill',
    format = 'auto',
    quality = 'auto',
    fetchFormat = 'auto'
  } = options;
  
  // Build transformation string
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (fetchFormat) transformations.push(`fl_${fetchFormat}`);
  
  const transformString = transformations.join(',');
  
  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Generate responsive image srcset
 * 
 * @param {string} url - Base image URL
 * @param {Array<number>} widths - Array of widths for srcset
 * @returns {string} srcset string
 * 
 * @example
 * const srcset = generateResponsiveSrcset(imageUrl, [400, 800, 1200]);
 * // Returns: "url-w400 400w, url-w800 800w, url-w1200 1200w"
 */
export function generateResponsiveSrcset(url, widths = [400, 800, 1200]) {
  return widths
    .map(width => {
      const optimized = optimizeCloudinaryImage(url, { width, format: 'auto', quality: 'auto' });
      return `${optimized} ${width}w`;
    })
    .join(', ');
}

/**
 * Measure component render time
 * 
 * @param {string} componentName - Name of component
 * @param {Function} renderFn - Render function
 * @returns {*} Result of render function
 * 
 * @example
 * const result = measureRenderTime('ClosetGrid', () => {
 *   return renderClosetGrid();
 * });
 */
export function measureRenderTime(componentName, renderFn) {
  const startTime = performance.now();
  const result = renderFn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
  
  if (duration > 16) { // More than one frame at 60fps
    console.warn(`[Performance] ${componentName} render is slow (${duration.toFixed(2)}ms)`);
  }
  
  return result;
}

/**
 * Request idle callback with fallback
 * 
 * @param {Function} callback - Function to execute during idle time
 * @param {Object} options - Options
 * 
 * @example
 * requestIdleCallback(() => {
 *   // Non-critical work
 *   preloadNextPage();
 * });
 */
export function requestIdleCallback(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for Safari
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50
      });
    }, 1);
  }
}

/**
 * Prefetch route for faster navigation
 * 
 * @param {string} url - URL to prefetch
 * 
 * @example
 * // Prefetch friends page when hovering nav link
 * navLink.addEventListener('mouseenter', () => {
 *   prefetchRoute('/friends');
 * });
 */
export function prefetchRoute(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
  
  console.log('[Performance] Prefetching route:', url);
}

/**
 * Get performance metrics
 * 
 * @returns {Object} Performance metrics
 */
export function getPerformanceMetrics() {
  if (!window.performance || !window.performance.timing) {
    return null;
  }
  
  const timing = performance.timing;
  const navigation = performance.navigation;
  
  return {
    // Page load times
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    dom: timing.domComplete - timing.domLoading,
    total: timing.loadEventEnd - timing.navigationStart,
    
    // Navigation type
    navigationType: navigation.type, // 0: navigate, 1: reload, 2: back/forward
    
    // Resource counts
    resourceCount: performance.getEntriesByType('resource').length
  };
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics() {
  const metrics = getPerformanceMetrics();
  
  if (metrics) {
    console.group('[Performance] Metrics');
    console.log('DNS Lookup:', `${metrics.dns}ms`);
    console.log('TCP Connection:', `${metrics.tcp}ms`);
    console.log('Request Time:', `${metrics.request}ms`);
    console.log('Response Time:', `${metrics.response}ms`);
    console.log('DOM Processing:', `${metrics.dom}ms`);
    console.log('Total Load Time:', `${metrics.total}ms`);
    console.log('Resources Loaded:', metrics.resourceCount);
    console.groupEnd();
  }
}
