# mwc3-back-helpers

## 0.2.0

### Minor Changes

- d3f7238: Add SYMBOLS_STYLESHEET_LINK_REGEX to regexps list
- d3f7238: Added `CodePoint` literal type to reference all available codepoints
- e0af879: Added various helper functions to download Material Symbols stylesheet and font
- d3f7238: Added `constructSymbolsFontStyleSheetUrl` helper (+ tests)

## 0.1.0

### Minor Changes

- Rename `CodePointsMap` to `CodePointsMapType` to avoid ambiguity with the actual codepoints map exported from `./codepoints-map.js`
- Export maps in package.json `exports` field
- Add `MdElement` string literal type that lists all elements
- Add maps to index.js
- Some type refactorings to reflect above changes
