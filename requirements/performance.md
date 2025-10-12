# Performance Requirements

## 1. Loading Performance Targets

- Initial page load: < 3 seconds
- Route transitions: < 500ms
- Image upload: < 5 seconds (including resize)
- API responses: < 500ms
- Time to Interactive (TTI): < 4 seconds

---

## 2. Optimization Techniques

### 2.1 Code Splitting

```javascript
// Lazy load routes with dynamic imports
const Closet = () => import('../pages/Closet.vue');
const Friends = () => import('../pages/Friends.vue');
const Profile = () => import('../pages/Profile.vue');

// Split vendor bundles
// Separate CSS chunks
```

---

### 2.2 Image Optimization

- Lazy load images below fold
- Use responsive images with srcset
- Preload critical images
- WebP format with JPEG/PNG fallbacks
- Generate multiple thumbnail sizes

---

### 2.3 Caching Strategy

**Multi-Layer Caching Architecture:**

```
┌─────────────────┐
│  Browser Cache  │  (Static assets, images)
├─────────────────┤
│  LocalStorage   │  (User preferences, auth tokens)
├─────────────────┤
│  Pinia Stores   │  (API response cache, optimistic updates)
├─────────────────┤
│  Service Worker │  (Offline support, background sync)
├─────────────────┤
│  Redis Cache    │  (Server-side: sessions, rate limits)
├─────────────────┤
│  CDN Cache      │  (Cloudinary images, static assets)
└─────────────────┘
```

**1. API Response Caching (Pinia):**

```javascript
// stores/clothesStore.js
export const useClothesStore = defineStore('clothes', {
  state: () => ({
    items: [],
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),
  
  actions: {
    async fetchClothes(forceRefresh = false) {
      const now = Date.now();
      const cacheValid = this.lastFetch && (now - this.lastFetch) < this.cacheTimeout;
      
      // Return cached data if valid
      if (!forceRefresh && cacheValid && this.items.length > 0) {
        console.log('Using cached clothes data');
        return this.items;
      }
      
      // Fetch fresh data
      const response = await api.get('/clothes');
      this.items = response.data;
      this.lastFetch = now;
      return this.items;
    },
    
    // Invalidate cache on mutations
    async addClothingItem(item) {
      const response = await api.post('/clothes', item);
      this.items.push(response.data);
      this.lastFetch = Date.now(); // Reset cache timer
    }
  }
});
```

**2. Redis Caching (Server-side):**

```javascript
// utils/cache.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: 3
});

// Cache with TTL
export async function cacheGet(key) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

// Cache middleware for Express
export function cacheMiddleware(ttlSeconds = 300) {
  return async (req, res, next) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    const cached = await cacheGet(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = (data) => {
      cacheSet(key, data, ttlSeconds);
      return originalJson(data);
    };
    
    next();
  };
}

// Usage in routes
app.get('/api/clothes', cacheMiddleware(300), async (req, res) => {
  // This response will be cached for 5 minutes
});
```

**3. Cache Invalidation Patterns:**

```javascript
// Pattern 1: Time-based (TTL)
// Good for: Slowly changing data, public content
await cacheSet('user:123:clothes', clothes, 300); // 5 min TTL

// Pattern 2: Event-based invalidation
// Good for: Data that changes on specific actions
async function addClothingItem(userId, item) {
  const result = await db.insert(item);
  
  // Invalidate related caches
  await redis.del(`user:${userId}:clothes`);
  await redis.del(`user:${userId}:count`);
  
  return result;
}

// Pattern 3: Versioned cache keys
// Good for: Multiple versions of same data
const cacheKey = `user:${userId}:clothes:v${version}`;

// Pattern 4: Tag-based invalidation
// Good for: Complex dependencies
async function invalidateByTag(tag) {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(`tag:${tag}`);
  }
}
```

**4. Browser Cache Configuration:**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // Hash filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
};

// Server: Set cache headers
app.use(express.static('dist', {
  maxAge: '1y',           // Cache static assets for 1 year
  immutable: true,        // Assets never change (hash in filename)
  etag: false            // Not needed with immutable
}));
```

**5. Service Worker Cache:**

```javascript
// public/sw.js
const CACHE_NAME = 'stylesnap-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/style.css'
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**Cache Strategy Summary:**
- ✅ Static assets: Browser cache (1 year) + CDN
- ✅ API responses: Pinia stores (5 min) + Redis (5 min)
- ✅ User preferences: LocalStorage (persistent)
- ✅ Images: Cloudinary CDN (permanent)
- ✅ Offline support: Service Worker (critical assets)
- ✅ Invalidation: Event-based for mutations, TTL for reads

---

### 2.4 Bundle Optimization

- Tree shake unused code
- Minify JS/CSS
- Compress with gzip/brotli
- Remove console.logs in production
- Analyze bundle size regularly

---

## 3. Mobile Performance

### 3.1 Touch Optimization

- Touch targets minimum 44x44px
- Debounce search inputs (300ms)
- Throttle scroll events (16ms)
- Optimize for 3G/4G networks
- Reduce animations on low-end devices

---

### 3.2 Memory Management

- Virtual scrolling for lists > 100 items
- Clean up event listeners
- Limit DOM nodes in large lists
- Optimize image memory usage
- Garbage collection optimization

---

## 4. API Performance

### 4.1 Database Optimization

**Query Optimization Patterns:**

```sql
-- Use EXPLAIN ANALYZE to identify slow queries
EXPLAIN ANALYZE
SELECT c.* FROM clothes c
WHERE c.user_id = $1 AND c.removed_at IS NULL
ORDER BY c.created_at DESC;

-- Look for:
-- - Seq Scan (should use Index Scan)
-- - High cost estimates
-- - Slow execution time

-- Optimize with covering indexes (see 003_indexes_functions.sql)
-- idx_clothes_user_active covers (user_id, removed_at, created_at)
```

**Prepared Statements:**

```javascript
// Node.js with pg library
const getClothesQuery = {
  name: 'get-user-clothes',
  text: 'SELECT * FROM clothes WHERE user_id = $1 AND removed_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
  values: [userId, limit, offset]
};

// Prepared statements are cached by database
// Reduces parsing overhead for repeated queries
```

**Query Performance Checklist:**
- ✅ Use indexes for common queries (see 003_indexes_functions.sql)
- ✅ Limit result sets with pagination (max 100 items per page)
- ✅ Cache frequent queries (see section 4.2 below)
- ✅ Optimize JOIN operations (use indexed foreign keys)
- ✅ Use database functions for complex logic (see get_friend_closet())
- ✅ Use prepared statements to reduce parsing overhead
- ✅ Monitor with EXPLAIN ANALYZE regularly
- ✅ Set statement_timeout to prevent runaway queries

**Database Connection Pooling:**

```javascript
// Configure connection pool for optimal performance
const pool = new Pool({
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
  statement_timeout: 5000     // Kill queries after 5s
});
```

---

### 4.2 Network Optimization

- Compress API responses
- Batch multiple requests
- Use HTTP/2 where available
- Implement request deduplication
- Cache API responses appropriately

---

## 5. Monitoring & Metrics

### 5.1 Performance Monitoring

**Core Web Vitals Tracking:**

```javascript
// utils/analytics.js
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Largest Contentful Paint (target: < 2.5s)
  onLCP((metric) => {
    reportMetric('LCP', metric);
  });

  // Interaction to Next Paint (target: < 200ms)
  onINP((metric) => {
    reportMetric('INP', metric);
  });

  // Cumulative Layout Shift (target: < 0.1)
  onCLS((metric) => {
    reportMetric('CLS', metric);
  });

  // First Input Delay (target: < 100ms)
  onFID((metric) => {
    reportMetric('FID', metric);
  });

  // First Contentful Paint (target: < 1.8s)
  onFCP((metric) => {
    reportMetric('FCP', metric);
  });

  // Time to First Byte (target: < 600ms)
  onTTFB((metric) => {
    reportMetric('TTFB', metric);
  });
}

// Report metrics to backend
function reportMetric(name, metric) {
  const body = {
    name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  };

  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    // Use sendBeacon for reliability (works even during page unload)
    navigator.sendBeacon('/api/analytics/metrics', JSON.stringify(body));
  } else {
    // Fallback to fetch with keepalive
    fetch('/api/analytics/metrics', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
      target: getTarget(name)
    });
  }
}

function getTarget(name) {
  const targets = {
    'LCP': '< 2.5s',
    'INP': '< 200ms',
    'CLS': '< 0.1',
    'FID': '< 100ms',
    'FCP': '< 1.8s',
    'TTFB': '< 600ms'
  };
  return targets[name] || 'N/A';
}

// Initialize in main.js
import { initPerformanceMonitoring } from './utils/analytics';
initPerformanceMonitoring();
```

**API Response Time Monitoring:**

```javascript
// utils/apiMonitoring.js
import axios from 'axios';

// Create axios instance with monitoring
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor: start timer
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Response interceptor: measure duration
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Track performance
    trackApiPerformance({
      method: response.config.method.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration,
      size: JSON.stringify(response.data).length
    });
    
    // Warn about slow requests
    if (duration > 1000) {
      console.warn(`[API] Slow request: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    if (error.config?.metadata) {
      const duration = Date.now() - error.config.metadata.startTime;
      
      trackApiPerformance({
        method: error.config.method.toUpperCase(),
        url: error.config.url,
        status: error.response?.status || 0,
        duration,
        error: true
      });
    }
    
    return Promise.reject(error);
  }
);

function trackApiPerformance(data) {
  // Send to backend analytics
  fetch('/api/analytics/api-performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    })
  }).catch(console.error);
}

export default api;
```

**Backend Monitoring (Express):**

```javascript
// middleware/monitoring.js
import client from 'prom-client'; // Prometheus metrics

// Create metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Monitoring middleware
export function monitoringMiddleware(req, res, next) {
  const start = Date.now();
  
  activeConnections.inc();
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
    activeConnections.dec();
    
    // Log slow requests
    if (duration > 500) {
      console.warn(`[SLOW] ${req.method} ${route} - ${duration}ms`);
    }
  });
  
  next();
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

**Performance Dashboard Setup:**

```javascript
// Analytics table schema
CREATE TABLE performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(10) NOT NULL,
  metric_value FLOAT NOT NULL,
  rating VARCHAR(20),
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_name_time 
ON performance_metrics(metric_name, created_at DESC);

// Query for dashboard
SELECT 
  metric_name,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
  COUNT(*) as sample_count
FROM performance_metrics
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY metric_name;
```

**Monitoring Checklist:**
- ✅ Core Web Vitals: LCP, INP, CLS, FID, FCP, TTFB
- ✅ API response times: Axios interceptors
- ✅ Image load performance: Resource Timing API
- ✅ Bundle size tracking: Vite build analysis
- ✅ Memory usage: Performance Observer API
- ✅ Backend metrics: Prometheus + Express middleware
- ✅ Error rates: Track 4xx/5xx responses
- ✅ Performance budget alerts: Automated threshold checks

---

### 5.2 Performance Budget

- Maximum bundle size: 500KB gzipped
- Maximum image size: 1MB after compression
- Maximum API response time: 500ms
- Maximum time to interactive: 4 seconds

---

## 6. Specific Component Performance

### 6.1 ClosetGrid Performance

- Virtual scrolling for large closets
- Lazy image loading
- Debounced filtering
- Optimized re-renders

---

### 6.2 SuggestionCanvas Performance

- Efficient drag-and-drop library
- Optimized re-renders during drag
- Memory-efficient item storage
- Smooth animations

**Related Tasks:** [TASK: 06-quotas-maintenance#6.4]
