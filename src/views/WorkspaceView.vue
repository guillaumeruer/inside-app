<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useLocationsStore, type Location } from '@/stores/locations'
import { useWorkspacesStore } from '@/stores/workspaces'

const route = useRoute()
const locationsStore = useLocationsStore()
const workspacesStore = useWorkspacesStore()

const { locations, loading, creating, loadError } = storeToRefs(locationsStore)
const { workspaces } = storeToRefs(workspacesStore)

const locationName = ref('')
const nameTouched = ref(false)
const createError = ref('')
const formVisible = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
const showLoadingSkeleton = ref(false)

let loadingTimer: number | undefined

const workspaceId = computed(() => String(route.params.workspaceId))
const locationId = computed(() =>
  route.params.locationId ? String(route.params.locationId) : null,
)

const workspace = computed(
  () => workspaces.value.find((entry) => entry.id === workspaceId.value) ?? null,
)

const currentLocation = computed(() =>
  locationId.value ? (locationsStore.byId.get(locationId.value) ?? null) : null,
)

const visibleLocations = computed(() =>
  locations.value.filter((location) => location.parent_id === locationId.value),
)

const breadcrumbs = computed<Location[]>(() => {
  const result: Location[] = []
  let location: Location | undefined = currentLocation.value ?? undefined
  const visited = new Set<string>()

  while (location && !visited.has(location.id)) {
    visited.add(location.id)
    result.unshift(location)

    location = location.parent_id ? locationsStore.byId.get(location.parent_id) : undefined
  }

  return result
})

const nameError = computed(() => {
  if (!nameTouched.value) {
    return ''
  }

  const name = locationName.value.trim()

  if (!name) {
    return 'Donnez un nom à cet emplacement.'
  }

  if (name.length > 120) {
    return 'Le nom ne doit pas dépasser 120 caractères.'
  }

  return ''
})

const pageTitle = computed(() => currentLocation.value?.name ?? workspace.value?.name ?? 'Espace')

async function loadWorkspace() {
  loadingTimer = window.setTimeout(() => {
    showLoadingSkeleton.value = true
  }, 300)

  if (workspaces.value.length === 0) {
    await workspacesStore.fetchWorkspaces()
  }

  await locationsStore.fetchLocations(workspaceId.value)

  window.clearTimeout(loadingTimer)
  showLoadingSkeleton.value = false
}

async function openForm() {
  formVisible.value = true
  createError.value = ''

  await nextTick()
  nameInput.value?.focus()
}

function closeForm() {
  formVisible.value = false
  locationName.value = ''
  nameTouched.value = false
  createError.value = ''
}

async function handleCreateLocation() {
  nameTouched.value = true
  createError.value = ''

  if (nameError.value) {
    return
  }

  try {
    await locationsStore.createLocation(workspaceId.value, locationName.value, locationId.value)

    closeForm()
  } catch {
    createError.value = 'La création de l’emplacement a échoué. Réessayez dans quelques instants.'
  }
}

watch(workspaceId, loadWorkspace, { immediate: true })

onBeforeUnmount(() => {
  window.clearTimeout(loadingTimer)
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 p-6 text-white">
    <div class="mx-auto max-w-3xl">
      <RouterLink
        :to="{ name: 'home' }"
        class="text-sm font-medium text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        ← Mes rangements
      </RouterLink>

      <section v-if="loading" class="mt-10 min-h-64" aria-live="polite" aria-busy="true">
        <div
          v-if="showLoadingSkeleton"
          class="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div class="h-4 w-32 rounded bg-slate-800"></div>
          <div class="mt-4 h-8 w-56 rounded bg-slate-800"></div>
          <div class="mt-8 space-y-3">
            <div class="h-16 rounded-xl bg-slate-800"></div>
            <div class="h-16 rounded-xl bg-slate-800"></div>
          </div>
        </div>
      </section>

      <section
        v-else-if="loadError"
        class="mt-10 rounded-2xl border border-red-900 bg-red-950/40 p-6"
      >
        <h1 class="text-xl font-semibold">Les emplacements n’ont pas pu être chargés</h1>
        <p class="mt-2 text-red-200">{{ loadError }}</p>

        <button
          type="button"
          class="mt-6 rounded-lg bg-red-200 px-4 py-2 font-semibold text-red-950"
          @click="loadWorkspace"
        >
          Réessayer
        </button>
      </section>

      <section
        v-else-if="!workspace || (locationId && !currentLocation)"
        class="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <h1 class="text-xl font-semibold">Emplacement introuvable</h1>
        <p class="mt-2 text-slate-400">Il n’existe pas ou vous n’avez plus accès à cet espace.</p>
      </section>

      <template v-else>
        <nav
          v-if="breadcrumbs.length"
          class="mt-8 flex flex-wrap items-center gap-2 text-sm text-slate-400"
          aria-label="Fil d’Ariane"
        >
          <RouterLink :to="{ name: 'workspace', params: { workspaceId } }" class="hover:text-white">
            {{ workspace?.name }}
          </RouterLink>

          <template v-for="location in breadcrumbs" :key="location.id">
            <span aria-hidden="true">/</span>

            <RouterLink
              :to="{
                name: 'location',
                params: {
                  workspaceId,
                  locationId: location.id,
                },
              }"
              class="hover:text-white"
            >
              {{ location.name }}
            </RouterLink>
          </template>
        </nav>

        <header class="mt-8 flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-emerald-400">
              {{ currentLocation ? 'Emplacement' : 'Espace' }}
            </p>

            <h1 class="mt-1 text-3xl font-bold">{{ pageTitle }}</h1>

            <p class="mt-2 text-slate-400">
              {{
                currentLocation
                  ? 'Contenu directement rangé dans cet emplacement.'
                  : 'Emplacements situés à la racine de cet espace.'
              }}
            </p>
          </div>

          <button
            v-if="!formVisible && visibleLocations.length"
            type="button"
            class="shrink-0 rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            @click="openForm"
          >
            Ajouter
          </button>
        </header>

        <form
          v-if="formVisible"
          class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          novalidate
          @submit.prevent="handleCreateLocation"
        >
          <label for="location-name" class="block text-sm font-medium">
            {{ currentLocation ? 'Nom du sous-emplacement' : 'Nom de l’emplacement' }}
          </label>

          <input
            id="location-name"
            ref="nameInput"
            v-model="locationName"
            type="text"
            maxlength="120"
            autocomplete="off"
            :disabled="creating"
            :aria-invalid="Boolean(nameError)"
            :aria-describedby="nameError ? 'location-name-error' : undefined"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
            placeholder="Garage, étagère, boîte rouge…"
            @blur="nameTouched = true"
          />

          <p v-if="nameError" id="location-name-error" class="mt-2 text-sm text-red-400">
            {{ nameError }}
          </p>

          <p
            v-if="createError"
            role="alert"
            class="mt-4 rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
          >
            {{ createError }}
          </p>

          <div class="mt-6 flex gap-3">
            <button
              type="submit"
              :disabled="creating"
              class="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:bg-emerald-800"
            >
              {{ creating ? 'Création…' : 'Créer l’emplacement' }}
            </button>

            <button
              type="button"
              :disabled="creating"
              class="rounded-lg border border-slate-700 px-4 py-2.5 font-medium transition hover:bg-slate-800"
              @click="closeForm"
            >
              Annuler
            </button>
          </div>
        </form>

        <section
          v-if="!formVisible && visibleLocations.length === 0"
          class="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center"
        >
          <h2 class="text-xl font-semibold">
            {{ currentLocation ? 'Cet emplacement est vide' : 'Aucun emplacement pour le moment' }}
          </h2>

          <p class="mx-auto mt-2 max-w-md text-slate-400">
            Ajoutez par exemple un placard, un tiroir, une étagère ou une boîte.
          </p>

          <button
            type="button"
            class="mt-6 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            @click="openForm"
          >
            Ajouter mon premier emplacement
          </button>
        </section>

        <ul v-else-if="visibleLocations.length" class="mt-8 space-y-3">
          <li v-for="location in visibleLocations" :key="location.id">
            <RouterLink
              :to="{
                name: 'location',
                params: {
                  workspaceId,
                  locationId: location.id,
                },
              }"
              class="flex min-h-16 items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 transition hover:border-slate-700 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span class="font-medium">{{ location.name }}</span>
              <span class="text-slate-500" aria-hidden="true">→</span>
            </RouterLink>
          </li>
        </ul>
      </template>
    </div>
  </main>
</template>
