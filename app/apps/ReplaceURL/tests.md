# Tests

## ReplaceURL.test.ts

- ReplaceURL
  - it applies the Wayback preset to the entered URL
  - it shows a URL generated from an empty input
  - it saves a pattern and applies it from the saved list
  - it opens the save modal and requires a pattern name
  - it shows an error for an invalid regular expression

## ReplaceURLPatternEditor.test.ts

- ReplaceURLPatternEditor
  - it autofocuses the URL input
  - it toggles regular-expression mode
  - it places both replacement fields and actions in the same row
  - it emits save when requested

## ReplaceURLPatternList.test.ts

- ReplaceURLPatternList
  - it emits a selected built-in pattern
  - it emits the mobile-site conversion preset
  - it emits the identifier of a deleted saved pattern

## useReplaceURL.test.ts

- useReplaceURL
  - it replaces every literal occurrence without interpreting replacement tokens
  - it uses a global regular expression when enabled
  - it reports invalid regular expressions
  - it applies the built-in Wayback pattern
  - it converts mobile subdomains to the regular site domain
  - it allows Steam links but rejects unsafe URL protocols
  - it saves, loads, and deletes named patterns
  - it rejects empty and duplicate pattern names
