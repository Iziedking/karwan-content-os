import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const REQUIRED_FILES = [
  'SKILL.md',
  'references/build-shape.md',
  'references/full-product-usage.md',
  'references/product.md',
  'references/testing.md',
  'references/wallets.md',
];

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  return crc >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function localHeader(name, contents, crc) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(33, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(contents.length, 18);
  header.writeUInt32LE(contents.length, 22);
  header.writeUInt16LE(name.length, 26);
  return header;
}

function centralHeader(name, contents, crc, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(33, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(contents.length, 20);
  header.writeUInt32LE(contents.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt32LE(offset, 42);
  return header;
}

export async function validateSkillSource(source) {
  const files = new Map();
  for (const relativePath of REQUIRED_FILES) {
    try {
      files.set(relativePath, await readFile(join(source, relativePath)));
    } catch (error) {
      if (error?.code === 'ENOENT') throw new Error(`missing required file: ${relativePath}`);
      throw error;
    }
  }

  const skill = files.get('SKILL.md').toString('utf8');
  if (!/^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(skill)) throw new Error('SKILL.md must contain YAML frontmatter');
  if (!/^name:\s*karwan\s*$/m.test(skill)) throw new Error('SKILL.md must declare name: karwan');
  if (!/^description:\s*\S.+$/m.test(skill)) throw new Error('SKILL.md must declare a description');
  if (!skill.includes('references/full-product-usage.md')) {
    throw new Error('SKILL.md must require references/full-product-usage.md');
  }
  if (!skill.includes('references/build-shape.md')) {
    throw new Error('SKILL.md must require references/build-shape.md');
  }
  return files;
}

export async function buildSkillZip({ source, output }) {
  const files = await validateSkillSource(source);
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const relativePath of REQUIRED_FILES) {
    const name = Buffer.from(relativePath, 'utf8');
    const contents = files.get(relativePath);
    const crc = crc32(contents);
    const local = localHeader(name, contents, crc);
    locals.push(local, name, contents);
    centrals.push(centralHeader(name, contents, crc, offset), name);
    offset += local.length + name.length + contents.length;
  }

  const central = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(REQUIRED_FILES.length, 8);
  end.writeUInt16LE(REQUIRED_FILES.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, Buffer.concat([...locals, central, end]));
  return output;
}
