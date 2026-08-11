import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSkillZip, validateSkillSource } from './archive.js';

const EXPECTED = [
  'SKILL.md',
  'references/full-product-usage.md',
  'references/product.md',
  'references/testing.md',
  'references/wallets.md',
];

function zipEntries(bytes) {
  const names = [];
  for (let offset = 0; offset <= bytes.length - 46; offset += 1) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) continue;
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    names.push(bytes.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
    offset += 45 + nameLength + extraLength + commentLength;
  }
  return names;
}

test('builds the distributable skill at the ZIP root', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'karwan-skill-zip-'));
  try {
    const output = join(dir, 'karwan-skill.zip');
    await buildSkillZip({ source: join(process.cwd(), 'packages/skill/skill/karwan'), output });
    assert.deepEqual(zipEntries(await readFile(output)), EXPECTED);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('build output is byte-for-byte deterministic', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'karwan-skill-zip-'));
  try {
    const first = join(dir, 'first.zip');
    const second = join(dir, 'second.zip');
    const source = join(process.cwd(), 'packages/skill/skill/karwan');
    await buildSkillZip({ source, output: first });
    await buildSkillZip({ source, output: second });
    assert.deepEqual(await readFile(first), await readFile(second));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('validation refuses an incomplete skill before archive creation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'karwan-skill-invalid-'));
  try {
    await mkdir(join(dir, 'references'));
    await writeFile(join(dir, 'SKILL.md'), '---\nname: karwan\ndescription: test\n---\n');
    await assert.rejects(validateSkillSource(dir), /missing required file: references\/full-product-usage\.md/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});




