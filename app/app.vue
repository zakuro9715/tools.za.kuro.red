<script setup>
const i18nHead = useLocaleHead()
const { t } = useI18n()
const route = useRoute()

const title = computed(() => t(route.meta.titleKey))
const description = computed(() => t(route.meta.descriptionKey))

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs.lang,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ...(i18nHead.value.meta || []),
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
    ...(i18nHead.value.link || []),
  ],
}))

useSeoMeta(() => ({
  title,
  description,
  ogImage: route.meta.ogImage,
  twitterCard: 'summary_large_image',
}))
const siteConfig = useSiteConfig()
</script>

<template>
  <NuxtPwaManifest />
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink :to="route">{{ title }}</NuxtLink>
        <span
          aria-hidden="true"
          class="mx-2"
        >|</span>
        <NuxtLink to="/">
          {{ siteConfig.name }}
        </NuxtLink>
      </template>

      <template #right>
        <LocaleSelect />
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

    <UApp>
      <UContainer class="py-4">
        <NuxtPage />
      </UContainer>
    </UApp>

    <USeparator />

    <UFooter>
      <p class="text-sm text-muted">
        &copy; 2026 zakuro. All rights reserved.
      </p>
    </UFooter>
  </UApp>
</template>
