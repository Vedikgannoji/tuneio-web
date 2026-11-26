import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Caching Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
  );
  next();
});

// JSON body parser
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tuneio-web',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Static assets
app.use(express.static(__dirname, {
  maxAge: '1h',
  index: 'index.html'
}));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[tuneio-web] Server listening at http://localhost:${PORT}`);
});

// Graceful termination
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('[tuneio-web] Server shut down gracefully');
  });
});
