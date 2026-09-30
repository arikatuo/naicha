const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const config = require('../project.config.json');
const ignore = config.packOptions.ignore;

function ignored(relativePath, isDirectory) {
  const name = relativePath.replaceAll('\\', '/');
  return ignore.some(({ type, value }) => {
    if (type === 'folder') return name === value || name.startsWith(`${value}/`);
    if (type === 'file') return !isDirectory && name === value;
    if (type === 'suffix') return !isDirectory && name.endsWith(value);
    return false;
  });
}

function sourceBytes(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute);
    if (entry.isSymbolicLink() || ignored(relative, entry.isDirectory())) return total;
    return total + (entry.isDirectory() ? sourceBytes(absolute) : fs.statSync(absolute).size);
  }, 0);
}

test('real-debug source stays below the 2 MiB limit with room for packaging overhead', () => {
  const bytes = sourceBytes();
  assert.ok(bytes < 1_800_000, `Source is ${bytes} bytes before IDE packaging`);
  for (const directory of ['docs', 'tests', 'sessions', '.omx']) {
    assert.equal(ignored(directory, true), true, `${directory} should stay out of the mini program`);
  }
  for (const asset of ['assets/icons/pork.png', 'assets/icons/bike.png', 'assets/icons/jogging.png']) {
    assert.equal(ignored(asset, false), true, `${asset} is not used at runtime`);
  }
});
