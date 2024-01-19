# mwc3-back-helpers

## 0.5.1

### Patch Changes

- The elements imports map now also includes lab elements.

## 0.5.0

### Minor Changes

- Added fonts artifact for offline access

## 0.4.0

### Minor Changes

- Added Material Symbols link tag html transformation helpers

## 0.3.3

### Patch Changes

- Fix `convertIconNamesToCodePoints` returned type

## 0.3.2

### Patch Changes

- Added `convertIconNamesToCodePoints` helper (`md-icons.js`)

## 0.3.1

### Patch Changes

- Explicit returned types to avoid verbatim declarations

## 0.3.0

### Minor Changes

- Added search icon names in file functions (in `md-icons.js`)
- Prune fake icon names in search functions

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
