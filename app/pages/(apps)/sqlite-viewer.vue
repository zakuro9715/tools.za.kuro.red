<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: t('apps.sqlite-viewer.title'), description: t('apps.sqlite-viewer.description'), ogImage: '/og-images/SqliteViewer.png', twitterCard: 'summary_large_image' })
</script>

<template>
  <SqliteViewer />
</template>
