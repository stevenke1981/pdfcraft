# Third-Party Notices

This file identifies third-party code, assets, and notices included with the PDFCraft Web release. It points to the license texts and source references; it does not replace those texts. Keep the applicable notice files with the release.

## PDFCraft license

The repository's `LICENSE` file contains the project's AGPL-3.0 license. The Web ZIP includes this file at its root.

## JavaScript packages

`licenses/npm-inventory.json` records the npm dependency inventory and the corresponding notice paths. The collected npm notices are under `licenses/npm/`, grouped by package and version. Preserve the complete directory, including files named `LICENSE`, `LICENCE`, `COPYING`, and other notice names. Some package notices use `LICENCE` spelling, including `openpyxl` and `et_xmlfile`.

The complete `licenses/vendored/` directory contains collected notices for bundled runtimes, fonts, and third-party libraries. Preserve the whole directory with the release.

The release includes runtime packages such as PDF.js (`pdfjs-dist` 4.8.69 and legacy 2.16.105), Phosphor Icons Web 2.1.2, and Tesseract.js 6.0.1 with `tesseract.js-core` 6.1.2. Their collected notices are recorded in the inventory under `licenses/npm/`, including:

- `licenses/npm/pdfjs-dist-4.8.69/LICENSE` and `licenses/npm/pdfjs-dist-2.16.105/LICENSE`
- `licenses/npm/@phosphor-icons__web-2.1.2/LICENSE`
- `licenses/npm/tesseract.js-6.0.1/LICENSE.md` and `licenses/npm/tesseract.js-core-6.1.2/LICENSE`

OCR can load the Tesseract worker and language data from a CDN at runtime. Network access may therefore be needed for OCR; the release does not claim that OCR or every other tool works offline on first use.

## PDF.js, fonts, and other bundled assets

Keep these PDF.js notices alongside the corresponding files in the built site:

- `public/pdfjs-annotation-viewer/LICENSE`
- `public/pdfjs-annotation-viewer/web/cmaps/LICENSE`
- `public/pdfjs-annotation-viewer/web/standard_fonts/LICENSE_FOXIT` and `LICENSE_LIBERATION`
- `public/pdfjs-viewer/cmaps/LICENSE` and `public/pdfjs-viewer/iccs/LICENSE`
- `public/pdfjs-viewer/standard_fonts/LICENSE_FOXIT` and `LICENSE_LIBERATION`
- `public/pdfjs-viewer/wasm/LICENSE_OPENJPEG`, `LICENSE_PDFJS_OPENJPEG`, `LICENSE_PDFJS_QCMS`, and `LICENSE_QCMS`

The bundled Noto Sans CJK SC font and the Alex Brush, Allura, Handlee, Kalam, and Sacramento fonts have license texts under `licenses/vendored/` (`font-noto.txt`, `font-alexbrush.txt`, `font-allura.txt`, `font-handlee.txt`, `font-kalam.txt`, and `font-sacramento.txt`). Phosphor icon assets are covered by the package notice listed above.

The PyMuPDF wheel under `public/pymupdf-wasm/` retains its embedded `LICENSE`, `LICENCE`, `COPYING`, and other notice files. Preserve the wheel as supplied, including the notices inside it.

## WebAssembly runtimes and source references

The component records, asset hashes, license-document references, and source archive manifest are in `licenses/vendored-sources.json` and `licenses/source-archives.json`. The Web release provides the listed source archives as attachments. The bundled runtime files were matched to the sources described below; the listed source recipes are provenance and source-access information, not a claim that these binaries were rebuilt for this release.

### LibreOffice WASM

The release includes LibreOffice WebAssembly assets from the LibreOffice 24.8 development build. The recorded source checkout is pinned to build ID `d1c9e0e4e1ddeb24fe8f93e56860b3765043f8b1` in [LibreOffice core](https://github.com/LibreOffice/core/tree/d1c9e0e4e1ddeb24fe8f93e56860b3765043f8b1). The converter wrapper and build configuration are from [matbeedotcom/libreoffice-document-converter](https://github.com/matbeedotcom/libreoffice-document-converter/tree/749a21a4a16c557cf75b59d8bc5aa19c19e4b05b).

The source recipe is in `build/build-wasm.sh`, `build/autogen.input`, and `build/patches/`, including the archive patches. Use the same LibreOffice source checkout's `download.lst` for external dependencies. The supplied WASM assets have not been rebuilt as part of this release.

Preserve the complete `readlicense_oo/license/license.xml` XHTML and the associated LibreOffice notices. The release's complete copy is `licenses/vendored/libreoffice-licenses.html`; it includes font and third-party notices and should not be shortened to only the MPL text. Related license files are `licenses/vendored/lo-notice.txt`, `lo-mpl.txt`, and `lo-lgpl.txt`.

### PyMuPDF WASM

The supplied wheel is PyMuPDF 1.26.3, built against MuPDF 1.26.3. The wrapper source is pinned to [alam00000/bentopdf-pymupdf-wasm at `a104fd5`](https://github.com/alam00000/bentopdf-pymupdf-wasm/tree/a104fd5de9c74d06eb030ee35ab6fa4f6e92694b); the upstream source references are [PyMuPDF 1.26.3](https://github.com/pymupdf/PyMuPDF/tree/1.26.3) and MuPDF 1.26.3. The corresponding source archives are listed in `licenses/source-archives.json` and supplied with the release.

The older wrapper recipe is inconsistent with the wheel in this release: `build_scripts/scripts/download.js` pins PyMuPDF revision `4a53405a51d29f2f620c0c7659b7c4d404a9f9c0`, and `buildDeps.js` expects `pymupdf-1.26.1-cp313-none-pyodide_2025_0_wasm32.whl`. Any corrected build instructions must use PyMuPDF 1.26.3, MuPDF 1.26.3, and the supplied wheel name `pymupdf-1.26.3-cp313-none-pyodide_2025_0_wasm32.whl`. The wrapper Dockerfile prepares an environment; it does not itself compile the WebAssembly artifact. The supplied wheel has not been rebuilt or rebuild-verified for this release.

Keep all license and notice files embedded in the wheel, including the original `COPYING` file.

### PDFium direct editor

The direct editor's supplied `editcore.wasm` matches the archive in [alam00000/bentopdf-pdfium-viewer at `f486379`](https://github.com/alam00000/bentopdf-pdfium-viewer/tree/f48637921bf43808261cf18d8a7e3ce7df6bb858). The PDFium source submodule is pinned to [fce2b00](https://github.com/alam00000/bentopdf-pdfium/tree/fce2b000cc7a9e2cabc92db41cd57ca03233f07d). The wrapper and submodule source archives are supplied with the release, as listed in `licenses/source-archives.json`.

The source recipe is in the wrapper's `packages/pdfium/build/` and `packages/pdfium/scripts/`; it requires the PDFium submodule and the external dependencies pinned through PDFium's `DEPS` recipe. The supplied archive is not evidence that every dependency or the final WASM binary was rebuilt. Preserve the PDFium, EmbedPDF, HarfBuzz, and third-party notices under `licenses/vendored/`.

### Pyodide and CPython

The PyMuPDF WASM runtime also includes Pyodide 0.28.0a3 and Python 3.13.2. Their source references are [pyodide/pyodide 0.28.0a3](https://github.com/pyodide/pyodide/tree/0.28.0a3) and [python/cpython v3.13.2](https://github.com/python/cpython/tree/v3.13.2). Preserve `licenses/vendored/pyodide-mpl.txt` and `licenses/vendored/cpython-license.txt`, plus all notices inside the bundled wheel.

### qpdf WASM

The release includes qpdf 12.2.0 as `public/qpdf.wasm`. Its qpdf WASM wrapper source is pinned to [neslinesli93/qpdf-wasm at `e661db2`](https://github.com/neslinesli93/qpdf-wasm/tree/e661db2d17e391a9fbe6b350b4ea6dbd8c385891); the qpdf source reference is [qpdf/qpdf at `856d32c`](https://github.com/qpdf/qpdf/tree/856d32c610334855d30e96d25eb5f9636fb62f08).

Preserve `licenses/vendored/qpdfNotice.txt` and `qpdfLicense.txt` for qpdf, `qpdfJpegLicense.txt` and `qpdfJpegIJG.txt` for libjpeg-turbo, and `qpdfZlibLicense.txt` for zlib. The pinned source references are [libjpeg-turbo `7aa2a89`](https://github.com/ImageMagick/jpeg-turbo/tree/7aa2a898c564041a24b09d0a6e780aaa632d08d3) and [zlib `21767c6`](https://github.com/madler/zlib/tree/21767c654d31d2dccdde4330529775c6c5fd5389). The wrapper package declares ISC in its `package.json`, but the package does not provide a separate license text. The recorded build uses Emscripten 3.1.74, the wrapper's `build.sh`, and `patches/jpeg-turbo.patch`; this release did not rebuild the WASM artifact.

### CoherentPDF browser JavaScript

The browser runtime is `public/coherentpdf.browser.min.js` (CoherentPDF 2.5.5). Apart from the leading 402-byte copyright comment, the runtime matches the official `dist/coherentpdf.browser.min.js` at [coherentgraphics/coherentpdf.js ref `47ce307`](https://github.com/coherentgraphics/coherentpdf.js/tree/47ce307fbdfe02fe74febf025cb20b97de46c032). Its matching official JavaScript source archive is [`coherentpdf-js-47ce307fbdfe02fe74febf025cb20b97de46c032.tar.gz`](https://codeload.github.com/coherentgraphics/coherentpdf.js/tar.gz/47ce307fbdfe02fe74febf025cb20b97de46c032). The archive contains the unminified browser JavaScript, `coherentpdf.js`, interface and build files including `exports.ml`, JavaScript crypto/compression stubs, `LICENSE.md`, and SJCL attribution. Preserve the complete archive and the vendored license texts, including `licenses/vendored/cpdfjsOriginalLicense.txt`.

The archive supplies the JavaScript source for the browser runtime; it is not a complete source archive of the original OCaml project. In an [author statement](https://discuss.ocaml.org/t/experience-report-making-a-javascript-library-from-an-ocaml-library-with-js-of-ocaml/10380), John Whitington states: "the license is just for the JavaScript output of js_of_ocaml, not the original OCaml source". This notice describes the stated AGPL grant as applying to the generated JavaScript output, and does not describe the original OCaml source as covered by that grant. Historical non-commercial OCaml source snapshots are not included or relabeled as AGPL source.

## Source archive attachments

The release source archives correspond to the immutable refs recorded in `licenses/source-archives.json`:

| Release attachment | Source or ref |
|---------------------|---------------|
| `libreoffice-core-d1c9e0e4-source.tar.gz` | LibreOffice core `d1c9e0e4e1ddeb24fe8f93e56860b3765043f8b1` |
| `libreoffice-converter-749a21a-source.tar.gz` | LibreOffice WASM wrapper and build scripts `749a21a4a16c557cf75b59d8bc5aa19c19e4b05b` |
| `pymupdf-1.26.3-source.tar.gz` | PyMuPDF `1.26.3` |
| [`mupdf-1.26.3-source.tar.gz`](https://github.com/ArtifexSoftware/mupdf-downloads/releases/download/1.26.3/mupdf-1.26.3-source.tar.gz) | Official MuPDF `1.26.3` source archive, including its dependencies; 64,525,703 bytes; SHA-256 `ab467fc2d888cd8424cdce4bc6dd7ec61f34820582ddf3769a336e6909d9a48e` |
| `bentopdf-pymupdf-a104fd5-source.tar.gz` | PyMuPDF WASM wrapper `a104fd5de9c74d06eb030ee35ab6fa4f6e92694b` |
| `bentopdf-pdfium-viewer-f486379-source.tar.gz` | PDFium editor wrapper `f48637921bf43808261cf18d8a7e3ce7df6bb858` |
| `bentopdf-pdfium-fce2b000-source.tar.gz` | PDFium source submodule `fce2b000cc7a9e2cabc92db41cd57ca03233f07d` |
| `coherentpdf-js-47ce307fbdfe02fe74febf025cb20b97de46c032.tar.gz` | CoherentPDF browser JavaScript source `47ce307fbdfe02fe74febf025cb20b97de46c032` |

The release's `SHA256SUMS` file provides checksums for release artifacts. The npm and vendored source manifests record package and source provenance; retain them with the source bundle and release records.

Web releases use tags in the form `web-YYYY.MM.DD.N`, separate from the upstream `v*.*.*` Docker tags. For example, `web-2026.10.11.1` is distributed as `pdfcraft-web-2026.10.11.1.zip`. The full source commit SHA is recorded in the release manifest.
