import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesContent = fs.readFileSync(
  path.resolve(process.cwd(), 'firestore.rules'),
  'utf8'
);
const blueprint = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'firebase-blueprint.json'), 'utf8')
) as { firestore: Record<string, unknown> };

test('firestore.rules includes global default-deny catch-all and rules_version 2', () => {
  assert.match(rulesContent, /rules_version\s*=\s*'2';/);
  assert.match(rulesContent, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
});

test('firestore.rules covers every collection declared in firebase-blueprint.json', () => {
  const collectionPaths = Object.keys(blueprint.firestore);
  assert.ok(collectionPaths.length >= 4);
  for (const colPath of collectionPaths) {
    const cleanMatch = colPath.replace(/^\//, '');
    assert.ok(
      rulesContent.includes(`match /${cleanMatch}`),
      `Missing match block for ${colPath}`
    );
  }
});

test('firestore.rules enforces email_verified, isValidId, affectedKeys().hasOnly, and request.time', () => {
  assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesContent.includes('function isValidId(id)'));
  assert.ok(rulesContent.includes('affectedKeys().hasOnly'));
  assert.ok(rulesContent.includes('incoming().createdAt == request.time'));
  assert.ok(rulesContent.includes('incoming().updatedAt == request.time'));
  assert.ok(!rulesContent.includes('allow list: if isSignedIn();'));
  assert.ok(!rulesContent.includes('allow read: if isSignedIn();'));
});
