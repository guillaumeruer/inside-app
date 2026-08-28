<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useItemsStore, type Item } from '@/stores/items'

const props = defineProps<{
  workspaceId: string
  locationId: string
}>()

const itemsStore = useItemsStore()

const { items, loading, creating, updatingItemId, deletingItemId, loadError } =
  storeToRefs(itemsStore)

const route = useRoute()

const formVisible = ref(false)
const editingItemId = ref<string | null>(null)
const deleteCandidateId = ref<string | null>(null)

const itemName = ref('')
const description = ref('')
const quantity = ref<number | null>(1)

const nameTouched = ref(false)
const quantityTouched = ref(false)

const saveError = ref('')
const deleteError = ref('')

const nameInput = ref<HTMLInputElement | null>(null)
const showLoadingSkeleton = ref(false)

let loadingTimer: number | undefined

const visibleItems = computed(() =>
  items.value.filter((item) => item.location_id === props.locationId),
)

const isEditing = computed(() => editingItemId.value !== null)

const saving = computed(
  () =>
    creating.value ||
    (editingItemId.value !== null && updatingItemId.value === editingItemId.value),
)

const highlightedItemId = computed(() =>
  typeof route.query.item === 'string' ? route.query.item : null,
)

const nameError = computed(() => {
  if (!nameTouched.value) {
    return ''
  }

  const name = itemName.value.trim()

  if (!name) {
    return 'Donnez un nom à cet objet.'
  }

  if (name.length > 160) {
    return 'Le nom ne doit pas dépasser 160 caractères.'
  }

  return ''
})

const quantityError = computed(() => {
  if (!quantityTouched.value) {
    return ''
  }

  if (quantity.value === null || !Number.isInteger(quantity.value) || quantity.value < 1) {
    return 'La quantité doit être un nombre entier supérieur ou égal à 1.'
  }

  return ''
})

async function loadItems() {
  window.clearTimeout(loadingTimer)

  loadingTimer = window.setTimeout(() => {
    showLoadingSkeleton.value = true
  }, 300)

  await itemsStore.ensureItems(props.workspaceId)

  window.clearTimeout(loadingTimer)
  showLoadingSkeleton.value = false
}

function resetForm() {
  editingItemId.value = null
  itemName.value = ''
  description.value = ''
  quantity.value = 1
  nameTouched.value = false
  quantityTouched.value = false
  saveError.value = ''
}

async function openCreateForm() {
  resetForm()
  formVisible.value = true

  await nextTick()
  nameInput.value?.focus()
}

async function openEditForm(item: Item) {
  editingItemId.value = item.id
  itemName.value = item.name
  description.value = item.description ?? ''
  quantity.value = item.quantity
  nameTouched.value = false
  quantityTouched.value = false
  saveError.value = ''
  formVisible.value = true

  await nextTick()
  nameInput.value?.focus()
}

function closeForm() {
  formVisible.value = false
  resetForm()
}

async function handleSaveItem() {
  nameTouched.value = true
  quantityTouched.value = true
  saveError.value = ''

  const validQuantity = quantity.value

  if (nameError.value || quantityError.value || validQuantity === null) {
    return
  }

  const input = {
    name: itemName.value,
    description: description.value,
    quantity: validQuantity,
  }

  try {
    if (editingItemId.value) {
      await itemsStore.updateItem(props.workspaceId, editingItemId.value, input)
    } else {
      await itemsStore.createItem(props.workspaceId, props.locationId, input)
    }

    closeForm()
  } catch {
    saveError.value = isEditing.value
      ? 'La modification de l’objet a échoué. Réessayez dans quelques instants.'
      : 'La création de l’objet a échoué. Réessayez dans quelques instants.'
  }
}

function requestDelete(itemId: string) {
  deleteCandidateId.value = itemId
  deleteError.value = ''
}

function cancelDelete() {
  deleteCandidateId.value = null
  deleteError.value = ''
}

async function confirmDelete(itemId: string) {
  deleteError.value = ''

  try {
    await itemsStore.deleteItem(props.workspaceId, itemId)

    cancelDelete()
  } catch {
    deleteError.value =
      'La suppression a échoué. L’objet a été conservé. Réessayez dans quelques instants.'
  }
}

watch(() => props.workspaceId, loadItems, { immediate: true })

watch(
  () => props.locationId,
  () => {
    closeForm()
    cancelDelete()
  },
)

onBeforeUnmount(() => {
  window.clearTimeout(loadingTimer)
})
</script>

<template>
  <section class="mt-12 border-t border-slate-800 pt-8">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold">Objets</h2>
        <p class="mt-1 text-sm text-slate-400">Objets rangés directement ici.</p>
      </div>

      <button
        v-if="!formVisible && !loading && !loadError"
        type="button"
        class="shrink-0 rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        @click="openCreateForm"
      >
        Ajouter un objet
      </button>
    </header>

    <div v-if="loading" class="mt-6 min-h-32" aria-live="polite" aria-busy="true">
      <div v-if="showLoadingSkeleton" class="animate-pulse space-y-3">
        <div class="h-20 rounded-xl bg-slate-900"></div>
        <div class="h-20 rounded-xl bg-slate-900"></div>
      </div>
    </div>

    <div v-else-if="loadError" class="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-5">
      <p class="font-medium">Les objets n’ont pas pu être chargés</p>
      <p class="mt-1 text-sm text-red-200">{{ loadError }}</p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-red-200 px-4 py-2 font-semibold text-red-950"
        @click="loadItems"
      >
        Réessayer
      </button>
    </div>

    <form
      v-else-if="formVisible"
      class="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      novalidate
      @submit.prevent="handleSaveItem"
    >
      <h3 class="text-lg font-semibold">
        {{ isEditing ? 'Modifier l’objet' : 'Ajouter un objet' }}
      </h3>

      <div class="mt-5">
        <label for="item-name" class="block text-sm font-medium"> Nom de l’objet </label>

        <input
          id="item-name"
          ref="nameInput"
          v-model="itemName"
          type="text"
          maxlength="160"
          autocomplete="off"
          :disabled="saving"
          :aria-invalid="Boolean(nameError)"
          :aria-describedby="nameError ? 'item-name-error' : undefined"
          class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
          placeholder="Guirlande lumineuse"
          @blur="nameTouched = true"
        />

        <p v-if="nameError" id="item-name-error" class="mt-2 text-sm text-red-400">
          {{ nameError }}
        </p>
      </div>

      <div class="mt-5">
        <label for="item-quantity" class="block text-sm font-medium"> Quantité </label>

        <input
          id="item-quantity"
          v-model.number="quantity"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          :disabled="saving"
          :aria-invalid="Boolean(quantityError)"
          :aria-describedby="quantityError ? 'item-quantity-error' : 'item-quantity-help'"
          class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900 sm:max-w-32"
          @blur="quantityTouched = true"
        />

        <p v-if="quantityError" id="item-quantity-error" class="mt-2 text-sm text-red-400">
          {{ quantityError }}
        </p>

        <p v-else id="item-quantity-help" class="mt-2 text-sm text-slate-500">
          Utilisez 1 pour un objet unique.
        </p>
      </div>

      <div class="mt-5">
        <label for="item-description" class="block text-sm font-medium">
          Description
          <span class="font-normal text-slate-500">— facultative</span>
        </label>

        <textarea
          id="item-description"
          v-model="description"
          rows="3"
          :disabled="saving"
          class="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
          placeholder="Blanc chaud, usage intérieur…"
        ></textarea>
      </div>

      <p
        v-if="saveError"
        role="alert"
        class="mt-5 rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
      >
        {{ saveError }}
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:bg-emerald-800"
        >
          {{
            saving
              ? isEditing
                ? 'Enregistrement…'
                : 'Création…'
              : isEditing
                ? 'Enregistrer'
                : 'Ajouter cet objet'
          }}
        </button>

        <button
          type="button"
          :disabled="saving"
          class="rounded-lg border border-slate-700 px-4 py-2.5 font-medium transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          @click="closeForm"
        >
          Annuler
        </button>
      </div>
    </form>

    <div
      v-else-if="visibleItems.length === 0"
      class="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center"
    >
      <h3 class="text-lg font-semibold">Aucun objet ici</h3>

      <p class="mx-auto mt-2 max-w-md text-slate-400">
        Ajoutez ce que contient physiquement cet emplacement.
      </p>

      <button
        type="button"
        class="mt-6 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        @click="openCreateForm"
      >
        Ajouter mon premier objet
      </button>
    </div>

    <ul v-else class="mt-6 space-y-3">
      <li
        v-for="item in visibleItems"
        :key="item.id"
        class="rounded-xl border bg-slate-900 px-5 py-4 transition"
        :class="
          item.id === highlightedItemId
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-800'
        "
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="font-medium">{{ item.name }}</h3>

            <p v-if="item.description" class="mt-1 whitespace-pre-line text-sm text-slate-400">
              {{ item.description }}
            </p>
          </div>

          <span
            class="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300"
          >
            × {{ item.quantity }}
          </span>
        </div>

        <div
          v-if="deleteCandidateId === item.id"
          class="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p class="font-medium text-red-200">Supprimer « {{ item.name }} » ?</p>

          <p class="mt-1 text-sm text-red-300">Cette action est définitive.</p>

          <p v-if="deleteError" role="alert" class="mt-3 text-sm text-red-300">
            {{ deleteError }}
          </p>

          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              :disabled="deletingItemId === item.id"
              class="rounded-lg bg-red-200 px-3 py-2 text-sm font-semibold text-red-950 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-wait disabled:bg-red-900 disabled:text-red-300"
              @click="confirmDelete(item.id)"
            >
              {{ deletingItemId === item.id ? 'Suppression…' : 'Confirmer la suppression' }}
            </button>

            <button
              type="button"
              :disabled="deletingItemId === item.id"
              class="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              @click="cancelDelete"
            >
              Annuler
            </button>
          </div>
        </div>

        <div v-else class="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            :aria-label="`Modifier ${item.name}`"
            @click="openEditForm(item)"
          >
            Modifier
          </button>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            :aria-label="`Supprimer ${item.name}`"
            @click="requestDelete(item.id)"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
