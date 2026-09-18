# AGENTS

@AGENTS.local.md

## Overview

This project is collection of standalone tool app.

### Structure

- `app/pages/app-name.vue` - app page.
- `app/apps/AppName` - app directory
- `app/apps/AppName/*.vue` - app components.
- `app/apps/AppName/useAppName.ts` - app composables.
- `app/apps/locales/messages.ts` - app locale messages.
- `app/components/` - shared components.
- `app/composables/` - shared composables

### Dev environment

- pnpm
- Nuxt 4 with TypeScript.
- `@nuxt/ui` for components.
- `@nuxtjs/seo` for SEO Header

### Design Rules

- Prefer nuxt-ui components. Use only minimal tailwind classes to styling.
- Simple and clean design.
- No gradients.
- Simple, clean and short text. Avoid long paragraphs.
- No emoji. Use icons but une only fewer.

### I18n

- Components local messages should be in `<i18n>` block in each component.
- Composables local messages should use with `useI18n(messages:{ /* messages*/ })`.
- Apps meta messages should be defined in `app/apps/locales/messages.ts`.
- Japanese and English should be provided.

## Development

### Coding style

- `.editorconfig`
- `.nuxt/eslint-config.mjs`
- `pnpm lint --fix` to fix lint errors.

### Git Operation

- Disallow ANY git operation.
### Component design

Components are classified into the following types according to their responsibilities:

- **Nuxt Page components**
  - Components corresponding to Nuxt pages.
  - Responsible for routing-dependent information, SEO metadata, and other concerns specific to the route.
  - Their primary responsibility is to configure the page and render the corresponding App component.
  - Page components should contain as little feature implementation as possible.

- **App components**
  - Components responsible for the overall functionality of a page.
  - Coordinate the major sections of the page and pass data between them.
  - Responsible for page-level behavior that is not directly related to routing or SEO.
  - UI-specific state management and event handling should be delegated to element components whenever possible.

- **Composite components**
  - Components that combine multiple components to form a feature or section, but do not represent an entire page.
  - Their primary responsibility is to arrange child components, define layouts, and pass data between them.
  - UI-specific state management and event handling should be delegated to element components whenever possible.
  - Complex logic and shared state should be extracted into composables.

- **Element components**
  - Components with a single UI responsibility or reusable behavior, such as buttons, inputs, dialogs, lists, and forms.
  - Responsible for UI-specific state management, event handling, input validation, and presentation logic.
  - Most of the implementation should be placed in element components.
  - If an element component has multiple responsibilities, split it into smaller element components or composables.

A page should generally be structured with a Nuxt Page component and an App component. The Nuxt Page component handles routing-dependent information and SEO, while the App component handles the overall functionality of the page.

As a general rule, Nuxt Page components, App components, and composite components should contain as little implementation as possible beyond composition and data passing. Routing and SEO concerns belong in Nuxt Page components, page-level functionality belongs in App components, UI-specific behavior belongs in element components, and complex logic or shared state should be extracted into composables.

Use `props` and `emits` for communication between parent and child components by default. Use `v-model` when two-way binding is appropriate. Avoid directly referencing sibling components and avoid excessive use of `provide/inject`.

- ## html migration

Migrate old html pages to Nuxt 4 app pages.

- Header and footer are already included in app layout. Remove them from old html pages.
- Use `useSeoMeta` to set SEO meta tags. Remove old meta tags from html pages.
- keep the layout but use nuxt-ui components instead tailwind classes.
- use theme colors instead of hardcoded colors.
- Write test for each component and composable. See Testing.

### Components

- Use `UCard` for card and panel like element.
- Use `UButton` for button element.

### i18n

- All embedded messages move to `<i18n>` block in each component.

### Files

#### Apps

for `old/some-app.html`:

- `app/pages/app-name.vue` : app page.
- `app/apps/AppName/`      : app directory
  - `AppName.vue`          : main app component.
  - `AppName.test.vue`     : test for main app component.
  - `Foo.vue`              : other components.
  - `Foo.test.vue`         : test for other components.
  - `useAppName.ts`        : app composables.
  - `useAppName.test.ts`   : test for app composables.
  - `useFoo.ts`            : other composables.
  - `useFoo.test.ts`       : test for other composables.

#### Testing

- Each component and composable should have test file in same directory.
- Use `data-testid` attribute for testing. If not exist, add it to the element for testing.
- Don't use i18n messages in test. Use `data-testid`.
- On `AppName.test.vue`, don't use mock for composables and components. Test real behavior of app.
