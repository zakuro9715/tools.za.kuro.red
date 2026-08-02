<script setup lang="ts">
import { ref } from 'vue'
const v = ref('text')
</script>
<template>
  <h1>home</h1>
  <div>
    <input v-model="v" />
    <p>{{ v }}</p>
  </div>
</template>
