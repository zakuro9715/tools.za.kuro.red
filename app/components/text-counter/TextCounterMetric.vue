<script setup lang="ts">
defineProps<{
  label: string
  value: string
  unit?: string
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }">
    <p class="mb-1 text-xs text-muted">
      {{ label }}
    </p>
    <p class="text-2xl font-bold tracking-tight">
      {{ value }}
      <span
        v-if="unit"
        class="text-xs font-normal text-muted"
      >{{ unit }}</span>
    </p>
  </UCard>
</template>
