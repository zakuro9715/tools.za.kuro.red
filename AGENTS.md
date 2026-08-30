# AGENTS

## Overview

This project is collection of standalone tool app.

### Directory

- `app/pages/(apps)/` - Contain each app pages.

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

## Development

### Coding style

- `.editorconfig`
- `.nuxt/eslint-config.mjs`
- `pnpm lint --fix` to fix lint errors.

### Git Operation

- Disallow ANY git operation.

## html migration

Migrate old html pages to Nuxt 4 app pages.

- Header and footer are already included in app layout. Remove them from old html pages.
- Use `useSeoMeta` to set SEO meta tags. Remove old meta tags from html pages.
- keep the layout but use nuxt-ui components instead tailwind classes.
- use theme colors instead of hardcoded colors.

### Components

- Use `UCard` for card and panel like element.
- Use `UButton` for button element.
