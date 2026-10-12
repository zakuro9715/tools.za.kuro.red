<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const selectedLocale = computed({
  get: () => locale.value,
  set: code => setLocale(code),
})
const selectedLocaleName = computed(() => locales.value.find(({ code }) => code === locale.value)?.name)
</script>

<template>
  <!-- Hack. Hyper customized select menu but just IconButton + List -->
  <USelectMenu
    v-model="selectedLocale"
    :items="locales"
    value-key="code"
    label-key="name"
    :aria-label="selectedLocaleName"
    data-testid="locale-select"
    color="neutral"
    variant="ghost"
    :trailing="false"
    :search-input="false"
    :content="{
      align: 'end',
      side: 'bottom',
    }"
    :ui="{ base: 'justify-center p-1.5', content: 'min-w-fit px-1' }"
  >
    <UIcon
      name="i-lucide-languages"
      class="size-5"
    />
  </USelectMenu>
</template>
