#!/usr/bin/env node
/**
 * Append a message to an inbox JSON file while keeping it valid JSON.
 *
 * Usage:
 *   node cli/lib/orchestration/post-message.js --target "/path/to/project" \
 *     --inbox orchestrator --from "stream-a-fork-1" --type "prd_complete" --prd "test-auth"
 */

import fs from 'fs/promises';
import path from 'path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function readJsonOrDefault(filePath, defaultValue) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

async function main() {
  const args = parseArgs(process.argv);

  const targetDir = args.target;
  const inboxName = args.inbox || 'orchestrator';
  const from = args.from || 'unknown';
  const type = args.type || 'status_update';
  const prd = args.prd || null;
  const story = args.story || null;
  const status = args.status || null;

  if (!targetDir) {
    process.stderr.write('Missing --target "/path/to/project"\n');
    process.exit(2);
  }

  const inboxDir = path.join(targetDir, '.sigma', 'orchestration', 'inbox');
  const inboxPath =
    inboxName === 'orchestrator'
      ? path.join(inboxDir, 'orchestrator.json')
      : path.join(inboxDir, `${inboxName}.json`);

  const data = await readJsonOrDefault(inboxPath, { messages: [], lastChecked: Date.now() });
  if (!Array.isArray(data.messages)) data.messages = [];

  const msg = {
    type,
    from,
    prd,
    story,
    status,
    timestamp: new Date().toISOString(),
    processed: false
  };

  // Remove null keys to keep messages tidy
  for (const k of Object.keys(msg)) {
    if (msg[k] === null) delete msg[k];
  }

  data.messages.push(msg);
  await fs.mkdir(path.dirname(inboxPath), { recursive: true });
  await fs.writeFile(inboxPath, JSON.stringify(data, null, 2));

  process.stdout.write(`OK wrote message to ${inboxPath}\n`);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n');
  process.exit(1);
});

