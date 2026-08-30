# AGENTS

@AGENTS.local.md

## Overview

This project is collection of standalone tool app.

### Structure

- `app/pages/(apps)/app-name.vue` - app page.
- `app/components/app-name/*.vue` - app components.
- `app/composables/app-name/*.ts` - app composables.

### Dev environment

- pnpm
- Nuxt 4 with TypeScript.
- `@nuxt/ui` for components.
- `@nuxtjs/seo` for SEO Header

### Design Rules

- Prefere nuxt-ui components. Use only minimal tailwind classes to styling.
- Simple and clean design.
- No gradients.
- Simple, clean and short text. Avoid long paragraphs.
- No emoji. Use icons but une only fewer.

### I18n

- All messaged should be in `<i18n>` block in each component. Do not use embedded messages.
- Japanese and English should be provided.

## Development

### Coding style

- `.editorconfig`
- `.nuxt/eslint-config.mjs`
- `pnpm lint --fix` to fix lint errors.

### Git Operation

- Disallow ANY git operation.

## Apps


## html migration

Migrate old html pages to Nuxt 4 app pages.

- Header and footer are already included in app layout. Remove them from old html pages.
- Use `useSeoMeta` to set SEO meta tags. Remove old meta tags from html pages.
- keep the layout but use nuxt-ui components instead tailwind classes.
- use theme colors instead of hardcoded colors.

### Components

- Use `UCard` for card and panel like element.
- Use `UButton` for button element.

### i18n

- All embedded messages move to `<i18n>` block in each component.

### Files

- `old/abc-efg.html` => `app/pages/(apps)/abc-efg.vue`

