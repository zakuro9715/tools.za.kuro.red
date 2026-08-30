<i18n lang="json5">
{
  title: 'メモ帳',
  description: 'ブラウザにメモを保存できるシンプルなメモ帳アプリです。'
}
</i18n>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('title'),
  description: t('description'),
  ogImage: '/og-images/Notepad.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <Notepad />
</template>
