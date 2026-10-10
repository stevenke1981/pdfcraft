import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
function leaves(value, prefix = '') {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => typeof child === 'string'
    ? [[prefix + key, child]] : Object.entries(leaves(child, prefix + key + '.'))));
}
const english = leaves(JSON.parse(fs.readFileSync(path.join(root, 'messages/en.json'), 'utf8')));
const args = (message) => [...message.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)(?:[,}])/g)].map(match => match[1]).sort().join(',');
const tags = (message) => [...message.matchAll(/<\/?([A-Za-z][A-Za-z0-9]*)\b[^>]*\/?>/g)].map(match => match[1]).sort().join(',');
const catalogs = Object.fromEntries(['zh-TW', 'ja'].map(locale => {
  const messages = leaves(JSON.parse(fs.readFileSync(path.join(root, `messages/${locale}.json`), 'utf8')));
  return [locale, {
    total: Object.keys(messages).length,
    missing: Object.keys(english).filter(key => !(key in messages)),
    extra: Object.keys(messages).filter(key => !(key in english)),
    incompatible: Object.keys(english).filter(key => messages[key] !== undefined && (args(messages[key]) !== args(english[key]) || tags(messages[key]) !== tags(english[key]))),
    sameAsEnglish: Object.keys(english).filter(key => messages[key] === english[key]),
  }];
}));
// An inventory, not proof that every literal is UI text. Units, sample document
// content and editor payloads require review before converting to translations.
const literals = [];
function scan(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.name === '__tests__') continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { scan(file); continue; }
    if (!file.endsWith('.tsx')) continue;
    const source = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function inspect(node) {
      let text;
      let kind;
      if (ts.isJsxText(node)) { text = node.text.trim(); kind = 'jsx-text'; }
      if (ts.isJsxAttribute(node) && ['aria-label', 'title', 'placeholder'].includes(node.name.getText(ast)) && node.initializer && ts.isStringLiteral(node.initializer)) {
        text = node.initializer.text; kind = node.name.getText(ast);
      }
      if (ts.isCallExpression(node) && /^(setError|setProgressMessage|setMessage)$/.test(node.expression.getText(ast)) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
        text = node.arguments[0].text; kind = node.expression.getText(ast);
      }
      if (text && /[A-Za-z]{3}/.test(text)) {
        const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
        literals.push({ file: path.relative(root, file).replaceAll('\\', '/'), line, kind, text });
      }
      ts.forEachChild(node, inspect);
    }
    inspect(ast);
  }
}
scan(path.join(root, 'src'));
const report = { englishKeys: Object.keys(english).length, catalogs, hardcodedLiteralCandidates: literals.length, literals };
const outputIndex = process.argv.indexOf('--output');
if (outputIndex !== -1 && process.argv[outputIndex + 1]) fs.writeFileSync(process.argv[outputIndex + 1], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, literals: undefined }, null, 2));
if (Object.values(catalogs).some(catalog => catalog.missing.length || catalog.extra.length || catalog.incompatible.length)) process.exitCode = 1;
