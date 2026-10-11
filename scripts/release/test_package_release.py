import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile


class PackageReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='pdfcraft-package-')
        self.repo = pathlib.Path(self.temp.name) / 'repo'
        (self.repo / 'scripts').mkdir(parents=True)
        shutil.copyfile(pathlib.Path(__file__).resolve().parent.parent / 'package_web_release.py', self.repo / 'scripts/package_web_release.py')
        files = {
            'out/en/index.html': '<html lang="en">Synthetic export</html>',
            'out/ja/index.html': '<html lang="ja">日本語</html>',
            'out/qpdf.wasm': '\0asm',
            'scripts/release/serve.mjs': 'export default 1;',
            'scripts/release/start-pdfcraft.cmd': '@echo off\nnode serve.mjs',
            'docs/web-release.md': 'Run node serve.mjs',
            'LICENSE': 'Synthetic test license',
            'THIRD_PARTY_NOTICES.md': 'Synthetic test notice',
            'licenses/runtime/LICENSE': 'Synthetic runtime license',
        }
        for relative, content in files.items():
            file = self.repo / relative
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(content, encoding='utf-8')
        self.output = pathlib.Path(self.temp.name) / 'artifacts'

    def tearDown(self):
        self.temp.cleanup()

    def package(self):
        return subprocess.run([sys.executable, str(self.repo / 'scripts/package_web_release.py'),
                               '--output', str(self.output), '--version', 'web-2026.10.11.1',
                               '--source-sha', 'a' * 40], capture_output=True, text=True)

    def test_package_is_runnable_layout_with_complete_relative_hash_inventory_and_no_overwrite(self):
        result = self.package()
        self.assertEqual(result.returncode, 0, result.stderr)
        with zipfile.ZipFile(self.output / 'pdfcraft-web-2026.10.11.1.zip') as archive:
            manifest = json.loads(archive.read('release-manifest.json'))
            self.assertEqual(manifest['sourceCommit'], 'a' * 40)
            self.assertIn('site/ja/index.html', archive.namelist())
            self.assertIn('serve.mjs', archive.namelist())
            self.assertIn('licenses/runtime/LICENSE', archive.namelist())
            for file in manifest['files']:
                data = archive.read(file['path'])
                self.assertEqual(len(data), file['bytes'])
                self.assertEqual(hashlib.sha256(data).hexdigest(), file['sha256'])
                self.assertFalse(pathlib.PureWindowsPath(file['path']).is_absolute())
        self.assertNotEqual(self.package().returncode, 0, 'Existing archives must not be overwritten')

    def test_refuses_absolute_windows_paths_and_missing_notices_before_writing_zip(self):
        file = self.repo / 'out/en/index.html'
        for private_path in [r'C:\Users\example\Documents\private.pdf', r'C:\\Users\\example\\private.pdf']:
            file.write_text(private_path, encoding='utf-8')
            self.assertNotEqual(self.package().returncode, 0)
            self.assertFalse(self.output.exists())
        file.write_text('<html>safe</html>', encoding='utf-8')
        (self.repo / 'THIRD_PARTY_NOTICES.md').unlink()
        self.assertNotEqual(self.package().returncode, 0)
        self.assertFalse(self.output.exists())


if __name__ == '__main__':
    unittest.main()
