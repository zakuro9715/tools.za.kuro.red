<script setup lang="ts">
const { t } = useI18n()

const apps = [
  { to: '/notepad', icon: 'i-lucide-notebook-pen', name: 'notepad' },
  { to: '/text-counter', icon: 'i-lucide-text-cursor-input', name: 'text-counter' },
  { to: '/text-checker', icon: 'i-lucide-spell-check-2', name: 'text-checker' },
  { to: '/password-generator', icon: 'i-lucide-key-round', name: 'password-generator' },
  { to: '/audio-video', icon: 'i-lucide-audio-lines', name: 'audio-video' },
  { to: '/midi-to-audio', icon: 'i-lucide-audio-waveform', name: 'midi-to-audio' },
  { to: '/sqlite-viewer', icon: 'i-lucide-database', name: 'sqlite-viewer' },
  { to: '/reshade-preset-viewer', icon: 'i-lucide-sliders-horizontal', name: 'reshade-preset-viewer' },
  { to: '/image-compare', icon: 'i-lucide-columns-2', name: 'image-compare' },
  { to: '/image-resize', icon: 'i-lucide-image-upscale', name: 'image-resize' },
  { to: '/walking-calc', icon: 'i-lucide-person-standing', name: 'walking-calc' },
  { to: '/network-info-checker', icon: 'i-lucide-network', name: 'network-info-checker' },
  { to: '/markdown-link', icon: 'i-lucide-link', name: 'markdown-link' },
  { to: '/replace-url', icon: 'i-lucide-link-2', name: 'replace-url' },
  { to: '/markdown-formatter', icon: 'i-lucide-file-pen-line', name: 'markdown-formatter' },
] as const

definePageMeta({
  titleKey: 'home.title',
  descriptionKey: 'home.description',
  ogImage: '/og-images/Home.png',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">
        {{ t('home.title') }}
      </h1>
      <p class="mt-1 text-muted">
        {{ t('home.description') }}
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
