<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: t('apps.reshade-preset-viewer.title'), description: t('apps.reshade-preset-viewer.description'), ogImage: '/og-images/ReShadePresetViewer.png', twitterCard: 'summary_large_image' })
</script>

<template>
  <ReshadePresetViewer />
</template>
