import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const clientSource = fs.readFileSync(new URL('../src/api/client.ts', import.meta.url), 'utf8');

test('admin API uses ProtoJSON for camelCase protobuf request fields', () => {
  assert.match(clientSource, /const PROTOJSON_HEADERS\s*=\s*\{/);
  assert.match(clientSource, /"Content-Type":\s*"application\/protojson"/);
  assert.match(clientSource, /Accept:\s*"application\/protojson"/);
  assert.match(clientSource, /headers:\s*PROTOJSON_HEADERS/);
});
