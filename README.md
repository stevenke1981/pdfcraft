# PDFCraft

<div align="center">
  <img src="public/images/logo.png" alt="PDFCraft Logo" width="120" height="120" />
  <h1>Professional PDF Tools</h1>
  <p><strong>Free, browser-based PDF tools</strong></p>
  <p>Merge, split, compress, convert, and edit PDFs in your browser.</p>
</div>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

</div>

This repository is the `stevenke1981/pdfcraft` fork of [PDFCraftTool/pdfcraft](https://github.com/PDFCraftTool/pdfcraft). It continues the browser-based PDF tool project and adds Traditional Chinese (Taiwan) and Japanese localization alongside English.

PDF files are processed in the browser and are not uploaded by the app's normal file-processing flow. Some features load supporting code or data over the network when needed. In particular, OCR can fetch the Tesseract worker and language data from a CDN, so the app does not promise that every tool works offline on first use. Changing the interface language does not translate or rewrite PDF contents.

The interface retains 15 languages and localized titles and descriptions for 132 tools. Common workflows and the standalone editor have multilingual primary UI. Some less-used legacy dialogs, spelling controls, and engine diagnostics may still appear in English; this is not a claim that every control in every tool is translated.

## Get the Web release

Download the **Web ZIP** from this fork's [GitHub Releases](https://github.com/stevenke1981/pdfcraft/releases), extract the complete archive, and follow the [Web release guide](docs/web-release.md). The archive contains a prebuilt static site and a small Node.js HTTP server for local use. It requires Node.js 22 or later; it does not require `npm install`.

Release tags use `web-YYYY.MM.DD.N`; for example, tag `web-2026.10.11.1` is distributed as `pdfcraft-web-2026.10.11.1.zip`. The date-counter tag format keeps Web releases distinct from the upstream `v*.*.*` Docker tags.

This is a web application package, not a native portable executable, installer, or MSI. Do not open its HTML files directly from disk; serve the site over HTTP. For exact Windows steps, static-host requirements, and update instructions, see [docs/web-release.md](docs/web-release.md).

## Run from source

For development, install Node.js 22 or later, clone this fork, install the project dependencies, and start the Next.js development server:

```bash
git clone https://github.com/stevenke1981/pdfcraft.git
cd pdfcraft
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The commands above are for source development. For the prebuilt Web release, use the ZIP instructions instead; `npm start` is not the release server.

## Features

- PDF organization, merging, splitting, page extraction, and rotation
- Editing, annotations, signatures, forms, watermarks, and page numbering
- Image and document conversion, OCR, compression, repair, and security tools
- A visual workflow editor with reusable templates
- Browser-side processing for the normal file workflow
- A multilingual interface across 15 languages

Tool availability and network requirements can vary by feature. OCR and some WebAssembly-based tools may load supporting assets on demand.

## Technology

- [Next.js 15](https://nextjs.org/) and [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS 4](https://tailwindcss.com/)
- [PDF.js](https://github.com/mozilla/pdf.js), [pdf-lib](https://github.com/Hopding/pdf-lib), and PyMuPDF WebAssembly

## Contributing

Contributions are welcome. Please open an issue or pull request against this fork, and include the affected tool or language in your description. Development commands and project scripts are defined in `package.json`.

## Acknowledgements

This fork builds on the work in [PDFCraftTool/pdfcraft](https://github.com/PDFCraftTool/pdfcraft). PDFCraft also acknowledges [BentoPDF](https://github.com/alam00000/bentopdf) as an important inspiration and reference for privacy-focused, client-side PDF tools. Thanks to both projects and their contributors.

## License

This project is licensed under [AGPL-3.0](LICENSE). The corresponding source archive and `SHA256SUMS` are provided with each Web release.
