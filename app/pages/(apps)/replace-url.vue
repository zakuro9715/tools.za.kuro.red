<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.replace-url.title'),
  description: t('apps.replace-url.description'),
  ogImage: '/og-images/ReplaceURL.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <ReplaceURL />
</template>
