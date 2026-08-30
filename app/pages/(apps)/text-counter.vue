<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('title'),
  description: t('description'),
  ogImage: '/og-images/TextCounter.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <TextCounter />
</template>

<i18n lang="json">
{
  "en": {
    "title": "Text counter",
    "description": "A simple tool that counts characters, lines, manuscript pages, book pages, and estimated reading time in real time."
  },
  "ja": {
    "title": "テキストカウンター",
    "description": "テキストの文字数、行数、原稿用紙換算枚数、文庫本ページ数、読了時間などをリアルタイムで計測するシンプルなテキストカウンターツールです。"
  }
}
</i18n>
