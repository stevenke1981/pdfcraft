# PDFCraft Web Release

This guide covers the prebuilt Web ZIP published by the `stevenke1981/pdfcraft` fork. The archive contains a static site in `site/` and a small Node.js server for running that site locally. It is a web application package, not a native portable app, EXE, MSI, or installer.

## Run the ZIP on Windows

1. Install Node.js 22 or later if it is not already installed.
2. Extract the entire Web ZIP to a folder you can keep in place.
3. Run `start-pdfcraft.cmd` from the extracted folder. This is a convenience launcher; no `npm install` is needed.
4. Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in your browser.

The server listens only on `127.0.0.1` and uses port `4173` by default. It does not open a browser window automatically. Keep the server process running while you use the app, then stop it in its terminal when finished. Do not open an HTML file directly from the extracted folder; the site needs to be served over HTTP.

To use a different port in Windows PowerShell, set `PDFCRAFT_PORT` before starting the server:

```powershell
$env:PDFCRAFT_PORT='4391'; node serve.mjs
```

Visit `http://127.0.0.1:4391` when using that example port. Press Ctrl+C in the terminal to stop the server. On a system without the Windows launcher, run `node serve.mjs` from the extracted release folder, then visit the configured local address.

Use a current Chrome, Edge, or Firefox browser. Chromium browsers on Windows are the only tested browser and platform combination; the others have not been verified.

## Host the static site

For a public deployment, use HTTPS so the browser treats the site as a secure context. Plain HTTP is for loopback/local use only. Publish the contents of `site/` to the root URL of an HTTPS static host. The release's Node server is intended for local use and binds only to loopback; use your hosting provider's static hosting for a public deployment.

Configure the host to return these headers for the site:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These headers enable browser features required by the application. Use these MIME types and encodings:

| Asset | `Content-Type` | `Content-Encoding` |
|-------|----------------|--------------------|
| `.wasm` and `.wasm.bin` | `application/wasm` | None |
| `.data.bin` | `application/octet-stream` | None |
| Complete `.wasm.gz`, `.wasm.bin.gz`, `.data.gz`, and `.data.bin.gz` files | Match the uncompressed asset type | `gzip` |
| `.part_N` files, including names that contain `.gz` | `application/octet-stream` | None |

Only complete `.wasm.gz`, `.wasm.bin.gz`, `.data.gz`, and `.data.bin.gz` assets use gzip content encoding. In particular, do not infer gzip encoding from a `.gz` substring in a `.part_N` filename. Incorrect headers or encodings can prevent WebAssembly tools from loading.

### Deploy under a subpath

The packaged site targets the root path. To host it under a path such as `/pdfcraft/`, rebuild from source with that `BASE_PATH` and deploy the resulting static export. Copying the existing ZIP's `site/` contents to a subdirectory does not rewrite its asset paths.

## Network and privacy

The normal file-processing flow runs in the browser; PDF contents are not uploaded by the app as part of that flow. Some tools load supporting assets on demand. OCR can fetch the Tesseract worker and language data from a CDN, and other tools may load WebAssembly assets when needed. The release therefore does not promise first-run or all-tool offline operation. Changing the UI language does not translate or rewrite PDF contents.

The interface includes 15 languages and localized titles and descriptions for 132 tools. Common workflows and the standalone editor have multilingual primary UI. Some less-used legacy dialogs, spelling controls, and engine diagnostics may still be in English.

## Updates and release files

Get Web ZIPs from the fork's [GitHub Releases](https://github.com/stevenke1981/pdfcraft/releases). To update, stop the running server, download and extract the new Web ZIP, and use the complete new release folder. The built-in updater is configured for `PDFCraftTool/pdfcraft`; it is not configured to update this fork, so use the fork's release page for updates.

Release tags use the form `web-YYYY.MM.DD.N`, separate from the upstream `v*.*.*` Docker tags. The Web ZIP name follows `pdfcraft-<tag>.zip`; for example, tag `web-2026.10.11.1` is distributed as `pdfcraft-web-2026.10.11.1.zip`. The final source commit SHA is recorded in the release manifest rather than embedded in the tag. Each release provides the corresponding source archives and `SHA256SUMS` as attachments; use the checksum file to verify downloaded artifacts. The archive includes `licenses/source-archives.json` and `licenses/vendored-sources.json` to record source and license provenance.

For maintainers packaging a release, run the server regression test with `node --test scripts/release/serve.test.mjs`. Create the release package with Python 3.9 or later's standard library:

```text
python scripts/package_web_release.py --output <dir> --version web-2026.10.11.1 --source-sha <full-40-character-commit-sha>
```

The project is licensed under AGPL-3.0; see the `LICENSE` file in the source repository and the license records and notices included with the release.

## Browser data and local files

The app keeps UI language preferences in browser local storage under `NEXT_LOCALE` and `pdfcraft-language-preference`, and in a browser cookie. Other preferences use local storage. Project metadata and options use IndexedDB; cached WebAssembly and browser assets use CacheStorage. The browser manages the profile that contains these stores.

The local Node server only reads and serves the static `site/` files; it does not store PDF files. A working document is held in browser memory, and exported files go to the download location configured in the browser.

Browser storage is scoped to the site origin. Changing the host or port creates a separate set of preferences and project data; the app does not migrate data between origins or move the browser profile. Clearing site data removes the site's preferences, cached assets, and project metadata.
