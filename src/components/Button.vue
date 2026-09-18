<template>
  <button :class="buttonClass" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const styles = {
  primary:
    'w-full rounded-lg px-4 py-3 font-semibold bg-primary text-white hover:bg-primary-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
}

const props = defineProps<{
  variant: keyof typeof styles
  type: string
}>()

const buttonClass = computed(() => styles[props.variant])
</script>
