<script setup lang="ts">
const { t } = useI18n()

const apps = [
  { to: '/notepad', icon: 'i-lucide-notebook-pen', name: 'notepad' },
  { to: '/text-counter', icon: 'i-lucide-text-cursor-input', name: 'text-counter' },
  { to: '/text-checker', icon: 'i-lucide-spell-check-2', name: 'text-checker' },
  { to: '/password-generator', icon: 'i-lucide-key-round', name: 'password-generator' },
  { to: '/audio-video', icon: 'i-lucide-audio-lines', name: 'audio-video' },
  { to: '/sqlite-viewer', icon: 'i-lucide-database', name: 'sqlite-viewer' },
  { to: '/reshade-preset-viewer', icon: 'i-lucide-sliders-horizontal', name: 'reshade-preset-viewer' },
  { to: '/image-compare', icon: 'i-lucide-columns-2', name: 'image-compare' },
  { to: '/image-resize', icon: 'i-lucide-image-upscale', name: 'image-resize' },
  { to: '/walking-calc', icon: 'i-lucide-person-standing', name: 'walking-calc' },
  { to: '/network-info-checker', icon: 'i-lucide-network', name: 'network-info-checker' },
] as const

useSeoMeta({
  title: t('title'),
  description: t('description'),
  ogImage: '/og-images/Home.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">
        {{ t('title') }}
      </h1>
      <p class="mt-1 text-muted">
        {{ t('description') }}
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UPageCard
        v-for="app in apps"
        :key="app.to"
        :to="app.to"
        :icon="app.icon"
        :title="t(`apps.${app.name}.title`)"
        :description="t(`apps.${app.name}.description`)"
      />
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Tools",
    "description": "A collection of tools by zakuro."
  },
  "ja": {
    "title": "ツール",
    "description": "zakuro によるツール集です。"
  }
}
</i18n>
