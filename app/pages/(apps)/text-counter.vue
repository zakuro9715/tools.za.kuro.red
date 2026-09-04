<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.text-counter.title'),
  description: t('apps.text-counter.description'),
  ogImage: '/og-images/TextCounter.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <TextCounter />
</template>
