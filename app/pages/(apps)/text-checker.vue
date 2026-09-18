<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: t('apps.text-checker.title'), description: t('apps.text-checker.description'), ogImage: '/og-images/TextChecker.png', twitterCard: 'summary_large_image' })
</script>

<template>
  <TextChecker />
</template>
