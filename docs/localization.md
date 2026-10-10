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
  Compression quality comparison, the standard algorithm option, preview image
  descriptions and the remove control also use localized labels.
- Ninety-three previously literal tool validation/load error call sites use
  shared localized messages. PDF editor mode buttons and save notices, form
  filling UI, and theme accessibility labels are also localized.
- Existing content in the other locales is retained. Newly added shared keys
  have English copy outside `ja`/`zh-TW` unless an existing translation applies.
- The follow-up starts at `023c799355068f588d929969cf5b196c60c6dfa3` and retains
  the original **414 candidates** verbatim in
  `docs/i18n-hardcoded-classification.json`: **338 owned visible strings** are
  localized, **76 technical constants** are retained, and **0** are third-party
  controls. The original src-only scan cannot establish an embedded-app boundary.
- A separate 424-entry inventory adds CJK text, conditional labels, alt text and
  component labels/descriptions: 264 visible strings are localized and 160
  runtime values, formats, units, template syntax and shortcut constants retained.
  The original denominator was not replaced by this broader scan.
- Further review covers 310 UI feedback/fallback occurrences (309 visible,
  one runtime mode enum), four dynamic feedback templates, 43 additional dynamic
  accessibility/brush labels, seven progress props and localized workflow
  summaries. Unreachable English fallbacks following valid next-intl calls are
  removed without counting them as newly translated controls. Invalid key aliases
  are repaired; the audit resolves 3,683 static calls in their actual namespaces
  with no missing messages.
- Each target catalog now has **3,766** keys. ICU argument/tag parity is intact.
  The seven unchanged English values are brands, technical labels and email
  examples; Japanese also retains five actual font-family names.
- The independent editor's 123 marked HTML attributes, 35 controller labels
  plus five font labels, and 36 mobile-dock literal occurrences use the main
  message catalogs. `sync-editor-translations.mjs` generates its static modules
  during install/dev/build. Text uses `textContent` and attributes, never HTML.
- This remains **a reviewed UI coverage claim, not complete translation of every
  possible runtime string**. The independent `app.js` controller still has
  uncommon dialogs, spelling details and engine-provided diagnostics in English;
  it is explicitly recorded as a legacy application controller, not relabeled
  third-party. PDF.js viewer resources and PDFium/WASM internals keep their own
  localization/diagnostics. Form-template field labels, user PDF text, metadata,
  filenames and format values remain document data. Key parity alone is not proof
  of complete UI coverage.

## Privacy and PDF content

Locale selection changes UI copy only. No PDF processing, OCR language option,
document text, default output filename or upload endpoint is changed. Browser
tests create synthetic PDFs containing known original text, merge, split,
compress and add a header/footer in all three languages, and inspect
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
synthetic PDF downloads. It also loads header/footer, OCG, background-color and
redaction controls and the independent editor at both viewport sizes. The
header/footer test preserves the literal `{page}`/`{total}` hints and the original
English document template across UI languages. Screenshots and fixture outputs are under ignored
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
