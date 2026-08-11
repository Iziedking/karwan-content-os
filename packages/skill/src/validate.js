#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSkillSource } from './archive.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await validateSkillSource(resolve(packageRoot, 'skill', 'karwan'));
console.log('Karwan skill is valid');
