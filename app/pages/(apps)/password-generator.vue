<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.password-generator.title'),
  description: t('apps.password-generator.description'),
  ogImage: '/og-images/PasswordGenerator.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <PasswordGenerator />
</template>
