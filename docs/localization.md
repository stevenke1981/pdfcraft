# Traditional Chinese and Japanese localization

This change completes the existing `zh-TW` and `ja` catalogs using Next.js and
next-intl. All 15 previously supported locales remain available. The starting
commit is `a30070241c82ae9f03b8ce6398a29182387c1764`.

## Language selection

The header and footer selectors retain the current route, query and fragment.
Both existing localStorage preference names are saved, with a `NEXT_LOCALE`
cookie fallback. The root route uses saved preferences before ordered browser
languages, and then English. Explicit locale URLs remain authoritative.

`zh-TW`, `zh-HK`, `zh-MO` and `zh-Hant` select Traditional Chinese; `zh-Hans`,
`zh-CN` and `zh-SG` select Simplified Chinese. Region tags such as `ja-JP` resolve
to their supported primary language. Blocked storage and malformed cookies do
not prevent switching. Keyboard Escape returns focus to the selector.

Static export HTML receives the corresponding `lang` and `dir` attributes in
`scripts/localize-static-html.mjs`; `LocaleDocument` maintains them during client
navigation. CJK system font stacks do not add external font requests.

## Coverage and limits

- English, Traditional Chinese and Japanese have matching message keys and ICU
  argument/tag inventories. New target-language strings contain no HTML markup;
  existing rich tool descriptions continue through the shared HTML sanitizer.
- All 132 configured tools have target-language titles, summaries and help
  content. Thirty newer tools previously reused English descriptions, steps,
  use cases and FAQs; they now have concise localized introductions and
  tool-specific option guidance. Japanese also gains the missing redact tool.
- Home/category/search UI, common actions, upload/password/limit validation,
  downloads, progress time estimates, breadcrumbs and navigation labels, error
  pages, PDF library loading, tours and batch control labels are localized.
  Merge/split/compress validation and status messages use localized copy.
- Ninety-three previously literal tool validation/load error call sites use
  shared localized messages. PDF editor mode buttons and save notices, form
  filling UI, and theme accessibility labels are also localized.
- Existing content in the other locales is retained. Newly added shared keys
  have English copy outside `ja`/`zh-TW` unless an existing translation applies.
- This is **not a complete translation of every tool control**. Some independent
  tool controls, processor-provided diagnostic messages and the separate
  `public/direct-pdf-editor` application still use English. The audit inventories
  JSX/label/title/placeholder/status literals, including units, examples and
  technical terms that must not be blindly translated. Dynamic expressions and
  embedded applications need separate review. Do not treat key parity as proof
  of complete UI coverage.

## Privacy and PDF content

Locale selection changes UI copy only. No PDF processing, OCR language option,
document text, default output filename or upload endpoint is changed. Browser
tests create synthetic PDFs containing known original text, merge, split and
compress them with the standard algorithm in all three languages, and inspect
the downloaded content streams and
page counts. No private PDFs are read. Tests block external requests and verify
that processing sends no POST/PUT/PATCH requests.

## Validation

```sh
npm ci
npm run lint
npm run typecheck
npm run audit:i18n -- --output localization-audit.json
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite uses an isolated headless Chromium context against the static
export served on loopback. It checks desktop (1440 x 1000) and mobile (390 x 844)
home/category/empty/error/tool screens, long Japanese OCR copy, CJK layout,
visible language controls, keyboard focus, persistence, locale fallback and
synthetic PDF downloads. Screenshots and fixture outputs are under ignored
`test-results/`. The dedicated read-only CI workflow performs these checks and
retains the evidence artifact; it does not deploy or release anything.

The repository's ESLint 9 dependency needed its missing flat configuration.
The added configuration keeps Next.js rules enabled; existing JSX quotation
errors and two `module` variable names were corrected to make lint usable.
Existing lint warnings are reported rather than disabling the rules.

Linux CI also exposed an existing updater test that expected a Windows release
asset while inheriting the runner OS from jsdom. The test now explicitly models
Windows, Linux and macOS clients and restores its mocked browser/fetch state.
The application updater and release behavior are unchanged.
