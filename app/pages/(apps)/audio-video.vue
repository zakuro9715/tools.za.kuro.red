<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.audio-video.title'),
  description: t('apps.audio-video.description'),
  ogImage: '/og-images/AudioVideo.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <AudioVideo />
</template>
