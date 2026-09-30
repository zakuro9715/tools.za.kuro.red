# Tests

## TextCounter.test.ts

- TextCounter
  - it updates displayed character count after text input
  - it clears the input when the clear button is clicked
  - it pastes text from the clipboard
  - it shows an error toast when clipboard access fails

## TextCounterMetric.test.ts

- TextCounterMetric
  - it renders the label, value, and unit
  - it does not render a unit when one is not provided

## useTextCounter.test.ts

- TextCounter
  - it returns zeroed statistics for empty text
  - it counts Unicode characters, whitespace, and normalized lines
  - it calculates page and reading-time estimates
  - it clears the text
