import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';"
  );
  next();
});

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

// Explicit Allowlist of Public Site Assets
const ALLOWLIST = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'],
  ['/gradient-ascii.js', 'gradient-ascii.js'],
  ['/wordmark.svg', 'wordmark.svg'],
  ['/tuneio-walkthrough.pdf', 'docs/tuneio-walkthrough.pdf']
]);

app.get('*', (req, res) => {
  const file = ALLOWLIST.get(req.path);
  if (!file) {
    return res.status(404).type('text/plain').send('Not Found');
  }
  if (req.path === '/tuneio-walkthrough.pdf') {
    res.setHeader('Content-Disposition', 'attachment; filename="tuneio-walkthrough.pdf"');
  }
  return res.sendFile(join(__dirname, file), { maxAge: '1h' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[tuneio-web] Server listening at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[tuneio-web] Error: Port ${PORT} is already in use.`);
    console.error(`Please stop any other process running on port ${PORT}, or set a different port with:`);
    console.error(`  PORT=3001 npm run dev\n`);
    process.exit(1);
  }
  throw err;
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('[tuneio-web] Server shut down gracefully');
  });
});
