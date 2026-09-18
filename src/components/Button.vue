<template>
  <button :class="buttonClass" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const styles = {
  primary:
    'w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-wait disabled:bg-emerald-800',
  disabled: '',
}

const props = defineProps<{
  variant: keyof typeof styles
  type: string
}>()

const buttonClass = computed(() => styles[props.variant])
</script>
