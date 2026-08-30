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

<i18n lang="json5">
{
  en: {
    title: 'Notepad',
    description: 'A simple notepad app that saves notes in your browser.'
  },
  ja: {
    title: 'メモ帳',
    description: 'ブラウザにメモを保存できるシンプルなメモ帳アプリです。'
  }
}
</i18n>
