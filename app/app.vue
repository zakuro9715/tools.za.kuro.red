<i18n lang="json5">
{
  en: {
    description: 'A collection of tools by zakuro',
  },
}
</i18n>

<script setup>
const i18nHead = useLocaleHead()
const { t } = useI18n()
const route = useRoute()
const title = 'Home'

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs.lang
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ...(i18nHead.value.meta || []),
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    ...(i18nHead.value.link || []),
  ],
}))

useSeoMeta(() => ({
  title,
  description: t('description'),
}))
const siteConfig = useSiteConfig()
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink :to="route">{{ title }}</NuxtLink>
        <span aria-hidden="true" class="mx-2">|</span>
        <NuxtLink to="/">
          {{ siteConfig.name }}
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="https://github.com/zakuro9715/tools.za.kuro.red"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <p class="text-sm text-muted">
        &copy; 2026 zakuro. All rights reserved.

      </p>
    </UFooter>
  </UApp>
</template>
