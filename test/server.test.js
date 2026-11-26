import test from 'node:test';
import assert from 'node:assert/strict';

test('health endpoint returns 200 and ok status', async () => {
  const res = await fetch('http://localhost:3000/api/health');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'tuneio-web');
});

test('static assets are served properly', async () => {
  const html = await fetch('http://localhost:3000/');
  assert.equal(html.status, 200);
  assert.ok(html.headers.get('content-type').includes('text/html'));

  const css = await fetch('http://localhost:3000/styles.css');
  assert.equal(css.status, 200);
  assert.ok(css.headers.get('content-type').includes('text/css'));

  const js = await fetch('http://localhost:3000/app.js');
  assert.equal(js.status, 200);
  assert.ok(js.headers.get('content-type').includes('application/javascript'));

  const asciiJs = await fetch('http://localhost:3000/gradient-ascii.js');
  assert.equal(asciiJs.status, 200);
  assert.ok(asciiJs.headers.get('content-type').includes('application/javascript'));

  const svg = await fetch('http://localhost:3000/wordmark.svg');
  assert.equal(svg.status, 200);
  assert.ok(svg.headers.get('content-type').includes('image/svg+xml'));
});
