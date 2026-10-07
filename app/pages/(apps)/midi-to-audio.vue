<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.midi-to-audio.title'),
  description: t('apps.midi-to-audio.description'),
  ogImage: '/og-images/MidiToAudio.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <MidiToAudio />
</template>
