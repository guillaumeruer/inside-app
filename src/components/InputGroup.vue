<template>
  <div>
    <label :for="inputId" class="block text-sm font-medium">
      <slot name="label" />
    </label>

    <input
      :id="inputId"
      v-model="inputValue"
      :type="inputType"
      :autocomplete="inputAutocomplete"
      :disabled="inputDisabled"
      :aria-invalid="Boolean(inputError)"
      class="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary disabled:cursor-wait"
      :placeholder="inputPlaceholder"
      @blur="$emit('blur')"
    />

    <p v-if="inputError" class="mt-2 text-sm text-red-700">
      {{ inputError }}
    </p>
  </div>
</template>

<script setup lang="ts">
const inputValue = defineModel<string>({ required: true })

defineProps<{
  inputId: string
  inputType: string
  inputError: string
  inputDisabled: boolean
  inputPlaceholder: string
  inputAutocomplete: string
}>()

defineEmits<{
  blur: []
}>()
</script>
