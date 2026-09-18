<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: t('apps.network-info-checker.title'), description: t('apps.network-info-checker.description'), ogImage: '/og-images/NetworkInfoChecker.png', twitterCard: 'summary_large_image' })
</script>

<template>
  <NetworkInfoChecker />
</template>
