<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { supabase } from '@/lib/supabase'

interface PublicChildLocation {
  id: string
  name: string
  description: string | null
}

interface PublicItem {
  id: string
  name: string
  description: string | null
  quantity: number
}

interface PublicLocationContents {
  id: string
  name: string
  description: string | null
  child_locations: PublicChildLocation[]
  items: PublicItem[]
}

type LoadStatus = 'loading' | 'loaded' | 'not-found' | 'error'

const route = useRoute()

const status = ref<LoadStatus>('loading')
const contents = ref<PublicLocationContents | null>(null)
const showLoadingSkeleton = ref(false)

let loadingTimer: number | undefined

const token = computed(() => String(route.params.token))

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isEmpty = computed(
  () => contents.value?.child_locations.length === 0 && contents.value.items.length === 0,
)

async function loadContents() {
  window.clearTimeout(loadingTimer)

  contents.value = null
  status.value = 'loading'
  showLoadingSkeleton.value = false

  if (!uuidPattern.test(token.value)) {
    status.value = 'not-found'
    return
  }

  loadingTimer = window.setTimeout(() => {
    showLoadingSkeleton.value = true
  }, 300)

  try {
    const { data, error } = await supabase.rpc('get_public_location_contents', {
      target_qr_token: token.value,
    })

    if (error) {
      throw error
    }

    if (!data) {
      status.value = 'not-found'
      return
    }

    contents.value = data as unknown as PublicLocationContents
    status.value = 'loaded'
  } catch {
    status.value = 'error'
  } finally {
    window.clearTimeout(loadingTimer)
    showLoadingSkeleton.value = false
  }
}

watch(token, loadContents, { immediate: true })

onBeforeUnmount(() => {
  window.clearTimeout(loadingTimer)
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
    <div class="mx-auto max-w-2xl">
      <header>
        <p class="text-sm font-semibold text-emerald-400">Inside</p>
        <p class="mt-1 text-sm text-slate-400">Consultation en lecture seule</p>
      </header>

      <section
        v-if="status === 'loading'"
        class="mt-10 min-h-64"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          v-if="showLoadingSkeleton"
          class="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div class="h-8 w-48 rounded bg-slate-800"></div>
          <div class="mt-8 space-y-3">
            <div class="h-20 rounded-xl bg-slate-800"></div>
            <div class="h-20 rounded-xl bg-slate-800"></div>
          </div>
        </div>
      </section>

      <section
        v-else-if="status === 'error'"
        class="mt-10 rounded-2xl border border-red-900 bg-red-950/40 p-6"
      >
        <h1 class="text-xl font-semibold">Le contenu n’a pas pu être chargé</h1>

        <p class="mt-2 text-red-200">Vérifiez votre connexion puis réessayez.</p>

        <button
          type="button"
          class="mt-6 rounded-lg bg-red-200 px-4 py-2 font-semibold text-red-950"
          @click="loadContents"
        >
          Réessayer
        </button>
      </section>

      <section
        v-else-if="status === 'not-found'"
        class="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <h1 class="text-xl font-semibold">Conteneur introuvable</h1>

        <p class="mt-2 text-slate-400">Ce QR code est invalide ou n’est plus actif.</p>
      </section>

      <template v-else-if="contents">
        <header class="mt-10">
          <p class="text-sm font-medium text-emerald-400">Conteneur</p>
          <h1 class="mt-1 text-3xl font-bold">{{ contents.name }}</h1>

          <p v-if="contents.description" class="mt-3 whitespace-pre-line text-slate-400">
            {{ contents.description }}
          </p>
        </header>

        <section
          v-if="isEmpty"
          class="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center"
        >
          <h2 class="text-xl font-semibold">Rien n’est enregistré ici</h2>

          <p class="mt-2 text-slate-400">
            Le contenu de ce conteneur n’a pas encore été renseigné.
          </p>
        </section>

        <section v-if="contents.child_locations.length" class="mt-10">
          <h2 class="text-xl font-semibold">Sous-conteneurs</h2>

          <ul class="mt-4 space-y-3">
            <li
              v-for="location in contents.child_locations"
              :key="location.id"
              class="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4"
            >
              <p class="font-medium">{{ location.name }}</p>

              <p
                v-if="location.description"
                class="mt-1 whitespace-pre-line text-sm text-slate-400"
              >
                {{ location.description }}
              </p>
            </li>
          </ul>
        </section>

        <section v-if="contents.items.length" class="mt-10">
          <h2 class="text-xl font-semibold">Objets</h2>

          <ul class="mt-4 space-y-3">
            <li
              v-for="item in contents.items"
              :key="item.id"
              class="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-medium">{{ item.name }}</p>

                  <p
                    v-if="item.description"
                    class="mt-1 whitespace-pre-line text-sm text-slate-400"
                  >
                    {{ item.description }}
                  </p>
                </div>

                <span class="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  × {{ item.quantity }}
                </span>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </main>
</template>
