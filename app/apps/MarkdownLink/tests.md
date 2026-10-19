# Tests

## MarkdownLink.test.ts

- MarkdownLink
  - it converts a URL with a title into a Markdown link
  - it falls back to the URL as the title when fetching fails
  - it generates an image link in image mode
  - it copies the result

## MarkdownLinkUrlForm.test.ts

- MarkdownLinkUrlForm
  - it autofocuses the URL input
  - it emits URL and title updates

## MarkdownLinkImageForm.test.ts

- MarkdownLinkImageForm
  - it shows a preview only for an HTTP image URL
  - it emits alt updates

## useMarkdownLink.test.ts

- useMarkdownLink
  - it uses the entered title for a single URL
  - it falls back to the URL when the title cannot be fetched
  - it uses the fetched page title
  - it builds an image link in image mode
  - it builds a plain image when the link URL is empty and nothing without an image URL
  - it does not fetch non-HTTP URLs
  - it reports a copy failure
