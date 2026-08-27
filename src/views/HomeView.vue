<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspacesStore } from '@/stores/workspaces'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()
const workspacesStore = useWorkspacesStore()

const { workspaces, currentWorkspace, loading, creating, loadError } = storeToRefs(workspacesStore)

const workspaceName = ref('')
const nameTouched = ref(false)
const createError = ref('')
const showLoadingSkeleton = ref(false)

let loadingTimer: number | undefined

const nameError = computed(() => {
  if (!nameTouched.value) {
    return ''
  }

  const name = workspaceName.value.trim()

  if (!name) {
    return 'Donnez un nom à votre espace.'
  }

  if (name.length > 100) {
    return 'Le nom ne doit pas dépasser 100 caractères.'
  }

  return ''
})

async function loadWorkspaces() {
  showLoadingSkeleton.value = true

  loadingTimer = window.setTimeout(() => {
    showLoadingSkeleton.value = true
  }, 300)

  await workspacesStore.fetchWorkspaces()

  window.clearTimeout(loadingTimer)
  showLoadingSkeleton.value = false
}

async function handleCreateWorkspace() {
  nameTouched.value = true
  createError.value = ''

  if (nameError.value) {
    return
  }

  try {
    await workspacesStore.createWorkspace(workspaceName.value)
    workspaceName.value = ''
    nameTouched.value = false
  } catch {
    createError.value = 'La création de votre espace a échoué. Réessayez dans quelques instants.'
  }
}

async function handleSignOut() {
  await auth.signOut()
  workspacesStore.reset()
  await router.replace({ name: 'auth' })
}

onMounted(loadWorkspaces)

onBeforeUnmount(() => {
  window.clearTimeout(loadingTimer)
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 p-6 text-white">
    <div class="mx-auto max-w-3xl">
      <header class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-emerald-400">Inside</p>

          <h1 class="mt-1 text-3xl font-bold">Mes rangements</h1>
        </div>

        <button
          type="button"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          @click="handleSignOut"
        >
          Se déconnecter
        </button>
      </header>

      <!-- Loading -------------------------------------------------------- -->

      <section v-if="loading" class="mt-12 min-h-64" aria-live="polite" aria-busy="true">
        <div
          v-if="showLoadingSkeleton"
          class="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div class="h-6 w-48 rounded bg-slate-800"></div>
          <div class="mt-4 h-4 w-full max-w-md rounded bg-slate-800"></div>
          <div class="mt-2 h-4 w-2/3 rounded bg-slate-800"></div>
        </div>
      </section>

      <!-- Loading error -------------------------------------------------- -->

      <section
        v-else-if="loadError"
        class="mt-12 rounded-2xl border border-red-900 bg-red-950/40 p-8"
      >
        <h2 class="text-xl font-semibold">Vos espaces n’ont pas pu être chargés</h2>

        <p class="mt-2 max-w-lg text-red-200">
          {{ loadError }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-lg bg-red-200 px-4 py-2 font-semibold text-red-950 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950"
          @click="loadWorkspaces"
        >
          Réessayer
        </button>
      </section>

      <!-- First workspace ------------------------------------------------ -->

      <section
        v-else-if="workspaces.length === 0"
        class="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
      >
        <div class="max-w-lg">
          <p class="text-sm font-medium text-emerald-400">Première étape</p>

          <h2 class="mt-2 text-2xl font-semibold">Créez votre premier espace</h2>

          <p class="mt-2 text-slate-400">
            Un espace représente par exemple votre maison, un logement en location ou un atelier.
          </p>
        </div>

        <form class="mt-8 max-w-lg" novalidate @submit.prevent="handleCreateWorkspace">
          <label for="workspace-name" class="block text-sm font-medium"> Nom de l’espace </label>

          <input
            id="workspace-name"
            v-model="workspaceName"
            type="text"
            autocomplete="off"
            maxlength="100"
            :disabled="creating"
            :aria-invalid="Boolean(nameError)"
            :aria-describedby="nameError ? 'workspace-name-error' : 'workspace-name-help'"
            class="mt-2 w-full rounded-lg border bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:ring-2 disabled:cursor-wait disabled:bg-slate-900"
            :class="
              nameError
                ? 'border-red-500 focus:border-red-400 focus:ring-red-500/30'
                : nameTouched
                  ? 'border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/30'
            "
            placeholder="Maison"
            @blur="nameTouched = true"
          />

          <p v-if="nameError" id="workspace-name-error" class="mt-2 text-sm text-red-400">
            {{ nameError }}
          </p>

          <p v-else id="workspace-name-help" class="mt-2 text-sm text-slate-500">
            Vous pourrez inviter d’autres personnes plus tard.
          </p>

          <p
            v-if="createError"
            role="alert"
            class="mt-4 rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
          >
            {{ createError }}
          </p>

          <button
            type="submit"
            :disabled="creating"
            class="mt-6 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-wait disabled:bg-emerald-800"
          >
            {{ creating ? 'Création en cours…' : 'Créer mon espace' }}
          </button>
        </form>
      </section>

      <!-- Loaded workspaces --------------------------------------------- -->

      <template v-else>
        <nav
          v-if="workspaces.length > 1"
          class="mt-10 flex gap-2 overflow-x-auto pb-2"
          aria-label="Choisir un espace"
        >
          <button
            v-for="workspace in workspaces"
            :key="workspace.id"
            type="button"
            class="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            :class="
              workspace.id === currentWorkspace?.id
                ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
            "
            @click="workspacesStore.selectWorkspace(workspace.id)"
          >
            {{ workspace.name }}
          </button>
        </nav>

        <section class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p class="text-sm font-medium text-emerald-400">Espace actif</p>

          <h2 class="mt-2 text-2xl font-semibold">
            {{ currentWorkspace?.name }}
          </h2>

          <p class="mt-3 max-w-lg text-slate-400">
            Votre espace est prêt. La prochaine étape sera d’y ajouter un premier emplacement.
          </p>

          <RouterLink
            v-if="currentWorkspace"
            :to="{
              name: 'workspace',
              params: { workspaceId: currentWorkspace.id },
            }"
            class="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Ouvrir cet espace
          </RouterLink>
        </section>
      </template>
    </div>
  </main>
</template>
