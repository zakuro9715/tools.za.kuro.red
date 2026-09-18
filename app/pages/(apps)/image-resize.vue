<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.image-resize.title'),
  description: t('apps.image-resize.description'),
  ogImage: '/og-images/ImageResize.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <ImageResize />
</template>
