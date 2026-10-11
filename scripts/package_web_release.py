"""Stream a prebuilt static export into a release ZIP using only Python stdlib."""
import argparse
import hashlib
import json
import pathlib
import re
import zipfile


def digest(file):
    value = hashlib.sha256()
    with file.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(block)
    return value.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=pathlib.Path)
    parser.add_argument('--version', required=True)
    parser.add_argument('--source-sha', required=True)
    args = parser.parse_args()
    if not re.fullmatch(r'web-\d{4}\.\d{2}\.\d{2}\.[1-9][0-9]*', args.version):
        parser.error('Expected web-YYYY.MM.DD.N version')
    if not re.fullmatch(r'[0-9a-f]{40}', args.source_sha):
        parser.error('Expected full source commit SHA')
    repo = pathlib.Path(__file__).resolve().parent.parent
    out = repo / 'out'
    if not (out / 'en' / 'index.html').is_file():
        raise RuntimeError('Build the static export first')
    entries = []
    for file in sorted(out.rglob('*')):
        if file.is_symlink() or (hasattr(file, 'is_junction') and file.is_junction()):
            raise RuntimeError(f'Symlinks cannot be packaged: {file.relative_to(out)}')
        if file.is_file():
            if not file.resolve().is_relative_to(out.resolve()):
                raise RuntimeError('Export file escapes the output directory')
            relative = file.relative_to(out).as_posix()
            if file.suffix in {'.html', '.js', '.mjs', '.json', '.css', '.txt', '.map'}:
                data = file.read_bytes()
                if re.search(rb'[A-Za-z]:[\\/]+(?:Users|Documents)[\\/]+', data, re.IGNORECASE):
                    raise RuntimeError(f'Absolute Windows path found in {relative}')
            if relative.endswith('.manifest.json'):
                manifest = json.loads(file.read_text(encoding='utf-8'))
                if 'filename' in manifest and pathlib.PureWindowsPath(manifest['filename']).name != manifest['filename']:
                    raise RuntimeError(f'Non-relative chunk filename in {relative}')
            entries.append((file, 'site/' + relative))
    extras = {
        'scripts/release/serve.mjs': 'serve.mjs',
        'scripts/release/start-pdfcraft.cmd': 'start-pdfcraft.cmd',
        'docs/web-release.md': 'README.md',
        'LICENSE': 'LICENSE',
        'THIRD_PARTY_NOTICES.md': 'THIRD_PARTY_NOTICES.md',
    }
    for source, target in extras.items():
        file = repo / source
        if not file.is_file():
            raise RuntimeError(f'Missing release file: {source}')
        entries.append((file, target))
    for file in sorted((repo / 'licenses').rglob('*')):
        if file.is_symlink() or (hasattr(file, 'is_junction') and file.is_junction()):
            raise RuntimeError('License symlink cannot be packaged')
        if file.is_file():
            entries.append((file, 'licenses/' + file.relative_to(repo / 'licenses').as_posix()))
    manifest = {
        'version': args.version, 'sourceCommit': args.source_sha,
        'sourceRepository': 'https://github.com/stevenke1981/pdfcraft',
        'artifactType': 'prebuilt-static-web', 'nodeMinimumVersion': '22',
        'host': '127.0.0.1', 'defaultPort': 4173, 'basePath': '',
        'files': [{'path': name, 'bytes': file.stat().st_size, 'sha256': digest(file)} for file, name in entries],
    }
    args.output.mkdir(parents=True, exist_ok=True)
    target = args.output / f'pdfcraft-{args.version}.zip'
    # Exclusive mode prevents silently replacing an already generated release.
    with zipfile.ZipFile(target, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
        for file, name in entries:
            archive.write(file, name)
        archive.writestr('release-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    if target.stat().st_size >= 2 * 1024**3:
        raise RuntimeError('Archive exceeds GitHub per-asset size limit')
    print(json.dumps({'file': target.name, 'bytes': target.stat().st_size, 'sha256': digest(target), 'files': len(entries), 'sourceCommit': args.source_sha}))


if __name__ == '__main__':
    main()
