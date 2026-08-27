<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useItemsStore, type Item } from '@/stores/items'
import { useLocationsStore, type Location } from '@/stores/locations'

interface SearchResult {
  item: Item
  path: Location[]
}

const props = defineProps<{
  workspaceId: string
  workspaceName: string
}>()

const router = useRouter()
const itemsStore = useItemsStore()
const locationsStore = useLocationsStore()

const { items, loading, loadError } = storeToRefs(itemsStore)

const query = ref('')
const activeIndex = ref(-1)
const showLoadingHint = ref(false)

let loadingTimer: number | undefined

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr')
    .trim()
}

function buildLocationPath(locationId: string) {
  const result: Location[] = []
  const visited = new Set<string>()
  let location = locationsStore.byId.get(locationId)

  while (location && !visited.has(location.id)) {
    visited.add(location.id)
    result.unshift(location)

    location = location.parent_id ? locationsStore.byId.get(location.parent_id) : undefined
  }

  return result
}

const normalizedQuery = computed(() => normalize(query.value))

const results = computed<SearchResult[]>(() => {
  if (!normalizedQuery.value) {
    return []
  }

  return items.value
    .filter((item) => {
      if (item.workspace_id !== props.workspaceId) {
        return false
      }

      const searchableText = normalize(`${item.name} ${item.description ?? ''}`)

      return searchableText.includes(normalizedQuery.value)
    })
    .map((item) => ({
      item,
      path: buildLocationPath(item.location_id),
    }))
    .sort((first, second) => first.item.name.localeCompare(second.item.name, 'fr'))
})

const activeResultId = computed(() => {
  const result = results.value[activeIndex.value]
  return result ? `search-result-${result.item.id}` : undefined
})

async function loadItems() {
  window.clearTimeout(loadingTimer)
  showLoadingHint.value = false

  loadingTimer = window.setTimeout(() => {
    showLoadingHint.value = true
  }, 300)

  await itemsStore.ensureItems(props.workspaceId)

  window.clearTimeout(loadingTimer)
  showLoadingHint.value = false
}

function resetActiveResult() {
  activeIndex.value = -1
}

function clearSearch() {
  query.value = ''
  activeIndex.value = -1
}

function selectResult(result: SearchResult) {
  void router.push({
    name: 'location',
    params: {
      workspaceId: props.workspaceId,
      locationId: result.item.location_id,
    },
    query: {
      item: result.item.id,
    },
  })

  clearSearch()
}

function handleKeydown(event: KeyboardEvent) {
  if (!results.value.length) {
    if (event.key === 'Escape') {
      clearSearch()
    }

    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = activeIndex.value >= results.value.length - 1 ? 0 : activeIndex.value + 1
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = activeIndex.value <= 0 ? results.value.length - 1 : activeIndex.value - 1
  }

  if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()

    const result = results.value[activeIndex.value]

    if (result) {
      selectResult(result)
    }
  }

  if (event.key === 'Escape') {
    clearSearch()
  }
}

watch(() => props.workspaceId, loadItems, { immediate: true })

watch(results, () => {
  if (activeIndex.value >= results.value.length) {
    activeIndex.value = -1
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(loadingTimer)
})
</script>

<template>
  <section class="relative mt-8">
    <label for="workspace-search" class="block text-sm font-medium"> Retrouver un objet </label>

    <div class="relative mt-2">
      <input
        id="workspace-search"
        v-model="query"
        type="search"
        autocomplete="off"
        :disabled="loading"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="workspace-search-results"
        :aria-expanded="Boolean(normalizedQuery)"
        :aria-activedescendant="activeResultId"
        class="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pr-12 pl-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
        placeholder="Rechercher par nom ou description…"
        @input="resetActiveResult"
        @keydown="handleKeydown"
      />

      <button
        v-if="query"
        type="button"
        class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        aria-label="Effacer la recherche"
        @click="clearSearch"
      >
        ×
      </button>
    </div>

    <p v-if="showLoadingHint" class="mt-2 text-sm text-slate-400" aria-live="polite">
      Chargement des objets…
    </p>

    <div v-else-if="loadError" class="mt-3 rounded-xl border border-red-900 bg-red-950/40 p-4">
      <p class="text-sm text-red-200">{{ loadError }}</p>

      <button
        type="button"
        class="mt-3 rounded-lg bg-red-200 px-3 py-2 text-sm font-semibold text-red-950"
        @click="loadItems"
      >
        Réessayer
      </button>
    </div>

    <div
      v-else-if="normalizedQuery"
      id="workspace-search-results"
      role="listbox"
      class="absolute z-10 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/30"
    >
      <p v-if="results.length === 0" class="p-4 text-sm text-slate-400">
        Aucun objet ne correspond. Essayez un nom plus court ou un mot de la description.
      </p>

      <button
        v-for="(result, index) in results"
        :id="`search-result-${result.item.id}`"
        :key="result.item.id"
        type="button"
        role="option"
        :aria-selected="index === activeIndex"
        class="block w-full rounded-lg px-4 py-3 text-left transition"
        :class="
          index === activeIndex ? 'bg-emerald-500 text-slate-950' : 'text-white hover:bg-slate-800'
        "
        @mouseenter="activeIndex = index"
        @click="selectResult(result)"
      >
        <span class="flex items-start justify-between gap-4">
          <span class="font-medium">{{ result.item.name }}</span>

          <span
            class="shrink-0 text-sm"
            :class="index === activeIndex ? 'text-emerald-950' : 'text-slate-400'"
          >
            × {{ result.item.quantity }}
          </span>
        </span>

        <span
          class="mt-1 block truncate text-sm"
          :class="index === activeIndex ? 'text-emerald-950' : 'text-slate-400'"
        >
          {{ workspaceName }}
          <template v-for="location in result.path" :key="location.id">
            / {{ location.name }}
          </template>
        </span>
      </button>
    </div>
  </section>
</template>
