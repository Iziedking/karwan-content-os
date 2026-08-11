#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSkillZip } from './archive.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv[2] || resolve(packageRoot, 'karwan-skill.zip'));
await buildSkillZip({ source: resolve(packageRoot, 'skill', 'karwan'), output });
console.log(output);
