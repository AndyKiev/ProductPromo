// The backend seed catalog is canonical; the SPA bundles the same offline fallback.
import { readFileSync, writeFileSync } from 'node:fs';
const source = new URL('../backend/backend/api_v1/msg/ui.json', import.meta.url);
const target = new URL('../frontend/src/i18n/ui.json', import.meta.url);
const contents = readFileSync(source, 'utf8');
if (process.argv.includes('--check')) {
  if (contents !== readFileSync(target, 'utf8')) throw new Error('Run node scripts/sync_i18n.mjs');
} else writeFileSync(target, contents);
