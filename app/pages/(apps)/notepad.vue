<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.notepad.title'),
  description: t('apps.notepad.description'),
  ogImage: '/og-images/Notepad.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <Notepad />
</template>
