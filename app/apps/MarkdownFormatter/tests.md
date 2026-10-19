# Tests

## MarkdownFormatter.test.ts

- MarkdownFormatter
  - it shows formatted markdown in the output
  - it shows a diff only when the output differs from the input
  - it applies a rule only while it is enabled
  - it fills the input with a sample that gets formatted
  - it clears the input when the clear button is clicked
  - it pastes text from the clipboard
  - it shows an error toast when pasting fails
  - it copies the output to the clipboard
  - it shows an error toast when copying fails

## MarkdownFormatterDiff.test.ts

- MarkdownFormatterDiff
  - it renders each diff line with its type
  - it renders nothing when there are no lines

## MarkdownFormatterRules.test.ts

- MarkdownFormatterRules
  - it does not expand or collapse the rules when the toggle-all button is clicked
  - it shows the number of active rules out of all rules
  - it hides the rules until expanded
  - it renders a checkbox for every rule
  - it emits updated rules when a checkbox is toggled
  - it disables all rules with the toggle button when every rule is enabled
  - it enables all rules with the toggle button when some rule is disabled

## useMarkdownFormatter.test.ts

- createDefaultRules
  - it enables every rule
- formatMarkdown general formatting
  - it normalizes nested list indents to 4 spaces
  - it converts tab indents to 4 spaces
  - it removes trailing spaces
  - it removes extra spaces after list and heading markers
  - it collapses consecutive blank lines into one
  - it adds blank lines around headings
  - it does not add blank lines at the start or end of the document
  - it adds a space after # in headings
  - it unifies bullet list markers to -
  - it converts bullet characters to - lists
  - it unifies horizontal rules to ---
  - it keeps a blank line before a converted rule to avoid a setext heading
  - it ends with exactly one newline
  - it returns an empty string for empty input
  - it normalizes CRLF line breaks to LF
- formatMarkdown auto fix
  - it renumbers ordered lists from 1
  - it renumbers nested and separate ordered lists independently
  - it keeps the ) delimiter when renumbering
  - it converts URLs in text to markdown links
  - it excludes trailing punctuation and Japanese text from URLs
  - it keeps balanced parentheses inside URLs
  - it does not convert URLs that are already links, autolinks, or html
  - it converts image URLs to markdown images
  - it leaves non-image URLs alone when only image conversion is enabled
  - it converts image URLs to plain links when image conversion is disabled
  - it removes spaces inside bold and strikethrough markers
  - it removes spaces between link text and destination
  - it adds a space when bold ending with punctuation touches following text
  - it does not touch plain parentheses after brackets
- formatMarkdown protected content
  - it does not change fenced code blocks
  - it does not change tilde fences or longer fences
  - it does not change inline code
  - it does not change indented code blocks
  - it does not change front matter
- formatMarkdown with all rules
  - it formats a mixed document
  - it is idempotent
  - it returns the input unchanged when every rule is disabled
- diffLines
  - it marks identical text as same
  - it marks removed and added lines
  - it handles insertions and deletions
  - it returns no lines for two empty strings
- useMarkdownFormatter
  - it starts with empty input and all rules enabled
  - it formats the input and reports changes
  - it reflects rule changes in the output
