import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const lock = JSON.parse(fs.readFileSync(path.join(repo, 'package-lock.json'), 'utf8'));
const destination = path.join(repo, 'licenses', 'npm');
fs.mkdirSync(destination, { recursive: true });
const inventory = [];
const upstreamNotices = {
  '@schummar/icu-type-parser': 'schummarLicense.txt',
  'client-only': 'clientOnlyLicenseActual.txt',
  'tr46': 'tr46LicenseAdded.txt',
};
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location || entry.dev || !location.startsWith('node_modules/')) continue;
  const folder = path.join(repo, location);
  if (!fs.existsSync(path.join(folder, 'package.json'))) continue;
  const pkg = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
  const name = pkg.name || location.split('node_modules/').pop();
  const id = `${name.replaceAll('/', '__')}-${pkg.version}`;
  const target = path.join(destination, id);
  fs.mkdirSync(target, { recursive: true });
  const copied = [];
  function collect(directory, depth = 0) {
    if (depth > 3) return;
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (item.isSymbolicLink()) continue;
      const file = path.join(directory, item.name);
      if (item.isDirectory() && /^(?:licen[sc]es?|legal|notices?)$/i.test(item.name)) collect(file, depth + 1);
      if (!item.isFile() || !/^(?:licen[sc]e|copying|notice|copyright|authors)(?:[._-]|$)/i.test(item.name)) continue;
      const relative = path.relative(folder, file);
      const output = path.join(target, relative);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.copyFileSync(file, output);
      copied.push(relative.replaceAll('\\', '/'));
    }
  }
  collect(folder);
  if (!copied.length && fs.existsSync(path.join(folder, 'README.md'))) {
    fs.copyFileSync(path.join(folder, 'README.md'), path.join(target, 'README.md'));
    copied.push('README.md');
  }
  if (!copied.length && upstreamNotices[name]) {
    const upstream = path.join(repo, 'licenses', 'vendored', upstreamNotices[name]);
    if (!fs.existsSync(upstream)) throw new Error(`Missing verified upstream license for ${name}`);
    fs.copyFileSync(upstream, path.join(target, 'LICENSE'));
    copied.push('LICENSE');
  }
  inventory.push({ name, version: pkg.version, license: pkg.license || entry.license || 'See package',
    repository: pkg.repository?.url || pkg.repository || null, sourceArchive: entry.resolved || null,
    integrity: entry.integrity || null, notices: copied.map(file => `npm/${id}/${file}`) });
}
fs.writeFileSync(path.join(repo, 'licenses', 'npm-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
console.log(`Collected license notices for ${inventory.length} installed production packages (a superset of browser-bundled dependencies).`);
