import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/AppContentManager.tsx', import.meta.url), 'utf8');

test('about page editor manages the Android version displayed by the app', () => {
  assert.match(source, /fetchVersions\(\{[^}]*platform:\s*"android"/s);
  assert.match(source, /name="version"/);
  assert.match(source, /name="buildNo"/);
  assert.match(source, /name="changelog"/);
  assert.match(source, /fetchLatestVersion\(\{\s*platform:\s*"android"\s*\}\)/);
});
