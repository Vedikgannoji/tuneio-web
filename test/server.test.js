import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

test('health endpoint returns 200 and ok status', async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'tuneio-web');
});

test('allowlisted static assets are served properly', async () => {
  const html = await fetch(`${BASE_URL}/`);
  assert.equal(html.status, 200);
  assert.ok(html.headers.get('content-type').includes('text/html'));

  const css = await fetch(`${BASE_URL}/styles.css`);
  assert.equal(css.status, 200);
  assert.ok(css.headers.get('content-type').includes('text/css'));

  const js = await fetch(`${BASE_URL}/app.js`);
  assert.equal(js.status, 200);
  assert.ok(js.headers.get('content-type').includes('application/javascript'));

  const asciiJs = await fetch(`${BASE_URL}/gradient-ascii.js`);
  assert.equal(asciiJs.status, 200);
  assert.ok(asciiJs.headers.get('content-type').includes('application/javascript'));

  const svg = await fetch(`${BASE_URL}/wordmark.svg`);
  assert.equal(svg.status, 200);
  assert.ok(svg.headers.get('content-type').includes('image/svg+xml'));

  const pdf = await fetch(`${BASE_URL}/tuneio-walkthrough.pdf`);
  assert.equal(pdf.status, 200);
  assert.ok(pdf.headers.get('content-type').includes('application/pdf'));
  assert.ok(pdf.headers.get('content-disposition')?.includes('tuneio-walkthrough.pdf'));
});

test('non-allowlisted source and config paths return 404', async () => {
  const blockedPaths = [
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/GradientASCII.jsx',
    '/test/server.test.js'
  ];

  for (const path of blockedPaths) {
    const res = await fetch(`${BASE_URL}${path}`);
    assert.equal(res.status, 404, `Expected 404 for ${path}`);
  }
});
