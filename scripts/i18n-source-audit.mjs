import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export function resolveTranslationNamespace(call, ast) {
  const name = call.expression.getText(ast);
  let scope = call.parent;
  while (scope) {
    if (ts.isFunctionLike(scope) || ts.isSourceFile(scope)) {
      let namespace;
      function visit(node) {
        if (node !== scope && ts.isFunctionLike(node)) return;
        if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name && node.initializer) {
          const initializer = ts.isAwaitExpression(node.initializer) ? node.initializer.expression : node.initializer;
          if (ts.isCallExpression(initializer) && /^(useTranslations|getTranslations)$/.test(initializer.expression.getText(ast))) {
            const argument = initializer.arguments[0];
            namespace = argument && ts.isStringLiteral(argument) ? argument.text : '';
            if (argument && ts.isObjectLiteralExpression(argument)) {
              namespace = argument.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(ast) === 'namespace')?.initializer?.text ?? '';
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(scope);
      if (namespace !== undefined) return namespace;
    }
    scope = scope.parent;
  }
  return undefined;
}

export function auditTranslationCalls(root, messages) {
  const calls = [], missing = [];
  function scan(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '__tests__') continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!/\.tsx?$/.test(file)) continue;
      const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      function visit(node) {
        if (ts.isCallExpression(node) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
          const namespace = resolveTranslationNamespace(node, ast);
          if (namespace !== undefined) {
            const key = [namespace, node.arguments[0].text].filter(Boolean).join('.');
            const entry = { file: path.relative(root, file).replaceAll('\\', '/'), line: ast.getLineAndCharacterOfPosition(node.getStart()).line + 1, key };
            calls.push(entry);
            if (typeof key.split('.').reduce((value, part) => value?.[part], messages) !== 'string') missing.push(entry);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  }
  scan(path.join(root, 'src'));
  return { staticCalls: calls.length, missing };
}
