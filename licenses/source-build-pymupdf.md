# PyMuPDF WASM source and corrected build recipe

This is an evidence-based correction of the supplied recipe, not a claim of a reproducible build. No compilation was performed during this review.

## Verified artifact

`pymupdf-1.26.3-cp313-none-pyodide_2025_0_wasm32.whl` (SHA-256 `d1b117dff663c247f1fad2b51e5d4c8b4b5fa6fda5a105e8adcc0b43b5e86f40`) exactly matches the wheel in BentoPDF's wrapper repository at commit `a104fd5de9c74d06eb030ee35ab6fa4f6e92694b`. Its `pymupdf/__init__.py` exactly matches PyMuPDF tag `1.26.3` (Git blob `65d88073f353ae2bc68066e4560248b687ec2d86`); `pymupdf/_build.py` names the MuPDF 1.26.3 source archive.

Supply PyMuPDF 1.26.3, MuPDF 1.26.3 with all submodule sources, and the BentoPDF wrapper archive and its build_scripts. Keep their licenses and original build files. A GitHub MuPDF tag archive alone omits the Git submodule contents.

## Corrections to the supplied BentoPDF recipe

In `build_scripts/scripts/download.js`, replace PyMuPDF ref `4a53405a51d29f2f620c0c7659b7c4d404a9f9c0` with `1.26.3` (or the resolved immutable commit of that tag). In `build_scripts/scripts/buildDeps.js`, change the copied wheel basename from `pymupdf-1.26.1-cp313-none-pyodide_2025_0_wasm32.whl` to `pymupdf-1.26.3-cp313-none-pyodide_2025_0_wasm32.whl`.

The supplied Dockerfile only prepares a toolchain: Python 3.13.2, Node 20.11, Emscripten 4.0.9, pyodide-build 0.30.5. It has no source COPY or compilation command. A docker build alone does not create the wheel.

## Explicit wheel compilation invocation

In the prepared Linux container, mount the two complete source directories at `/work/PyMuPDF` and `/work/mupdf`, then run:

```sh
. /opt/emsdk/emsdk_env.sh
cd /work/PyMuPDF
env SKIP_EMSCRIPTEN_VERSION_CHECK=1 \
    HAVE_LIBCRYPTO=no \
    OS=pyodide \
    PYMUPDF_SETUP_FLAVOUR=pb \
    PYMUPDF_SETUP_MUPDF_BUILD=/work/mupdf \
    PYMUPDF_SETUP_MUPDF_BUILD_TESSERACT=0 \
    PYMUPDF_SETUP_MUPDF_TESSERACT=0 \
    pyodide build --exports whole_archive
test -s dist/pymupdf-1.26.3-cp313-none-pyodide_2025_0_wasm32.whl
```

PyMuPDF 1.26.3 `setup.py` documents `PYMUPDF_SETUP_MUPDF_BUILD` as a local source-directory override and `PYMUPDF_SETUP_MUPDF_TESSERACT=0` as the switch that excludes Tesseract. The additional BUILD_TESSERACT variable is retained from BentoPDF's recipe; it is not the documented controlling switch in PyMuPDF's setup.py. The invocation supplies local MuPDF instead of relying on the default network download.

No assertion is made that these commands regenerate byte-for-byte the existing wheel. The upstream wrapper does not preserve a complete build provenance record, and its stale version references were corrected by source inspection.

