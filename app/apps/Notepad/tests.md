# Tests

## Notepad.test.ts

- Notepad
  - it saves input and displays the saved memo
  - it clears the current editor content and starts a new memo
  - it toggles and closes the memo list
  - it requires confirmation before clearing all memos

## useNotepad.test.ts

- useNotepad
  - it loads saved memos on mount
  - it creates and persists a memo with a truncated title
  - it does not save an empty new memo
  - it selects and deletes a memo while updating storage and the route
  - it clears all memos, the draft, and the route
