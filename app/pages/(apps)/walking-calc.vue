<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('apps.walking-calc.title'),
  description: t('apps.walking-calc.description'),
  ogImage: '/og-images/WalkingCalc.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <WalkingCalc />
</template>
