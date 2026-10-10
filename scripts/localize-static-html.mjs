import fs from 'node:fs';
import path from 'node:path';

// A root layout above [locale] cannot read its child's route parameter. Apply
// language attributes to the static export as well as client-side navigation.
const catalogs = path.resolve('messages');
let updated = 0;
for (const filename of fs.readdirSync(catalogs).filter(file => file.endsWith('.json'))) {
  const locale = filename.slice(0, -5);
  const directory = path.resolve('out', locale);
  if (!fs.existsSync(directory)) continue;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const source = fs.readFileSync(file, 'utf8');
        const localized = source.replace(/<html\b([^>]*)>/, (_, attributes) => {
          const other = attributes.replace(/\s+(?:lang|dir)="[^"]*"/g, '');
          return `<html lang="${locale}" dir="${direction}"${other}>`;
        });
        if (source !== localized) { fs.writeFileSync(file, localized); updated++; }
      }
    }
  }
  visit(directory);
}
console.log(`Localized ${updated} exported HTML documents.`);
