<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.image-compare.title'),
  description: t('apps.image-compare.description'),
  ogImage: '/og-images/ImageCompare.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <ImageCompare />
</template>
