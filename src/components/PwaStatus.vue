<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const isOnline = ref(navigator.onLine)
const isUpdating = ref(false)
const updateError = ref('')

let updateTimer: number | undefined

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) {
      return
    }

    updateTimer = window.setInterval(
      () => {
        void registration.update()
      },
      60 * 60 * 1000,
    )
  },

  onRegisterError(error) {
    console.error('Service worker registration failed:', error)
  },
})

function updateConnectionStatus() {
  isOnline.value = navigator.onLine
}

function dismissUpdate() {
  needRefresh.value = false
  updateError.value = ''
}

async function applyUpdate() {
  isUpdating.value = true
  updateError.value = ''

  try {
    await updateServiceWorker(true)
  } catch (error) {
    console.error('PWA update failed:', error)
    updateError.value = 'La mise à jour a échoué. Vérifiez votre connexion puis réessayez.'
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateConnectionStatus)
  window.removeEventListener('offline', updateConnectionStatus)

  if (updateTimer !== undefined) {
    window.clearInterval(updateTimer)
  }
})
</script>

<template>
  <div aria-live="polite" aria-atomic="true">
    <Transition name="notice">
      <div
        v-if="!isOnline"
        role="status"
        class="offline-banner fixed inset-x-0 top-0 z-50 border-b border-amber-800 bg-amber-950 text-amber-100 shadow-lg"
      >
        <div class="mx-auto flex max-w-5xl items-start gap-3 px-4 pb-3 text-sm">
          <svg
            aria-hidden="true"
            class="mt-0.5 size-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path
              d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z"
            />
          </svg>

          <p>
            <strong class="font-semibold">Vous êtes hors connexion.</strong>
            L’interface reste accessible, mais les données ne peuvent pas être chargées ou
            synchronisées.
          </p>
        </div>
      </div>
    </Transition>

    <Transition name="notice">
      <section
        v-if="needRefresh"
        role="status"
        class="update-notice fixed inset-x-4 z-50 rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 shadow-2xl sm:left-auto sm:right-4 sm:max-w-md"
      >
        <p class="font-semibold">Une nouvelle version est disponible</p>

        <p class="mt-1 text-sm text-slate-300">
          Mettez l’application à jour pour profiter des dernières améliorations.
        </p>

        <p v-if="updateError" role="alert" class="mt-3 text-sm text-red-300">
          {{ updateError }}
        </p>

        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            @click="dismissUpdate"
          >
            Plus tard
          </button>

          <button
            type="button"
            :disabled="isUpdating"
            class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-60"
            @click="applyUpdate"
          >
            {{ isUpdating ? 'Mise à jour…' : 'Mettre à jour' }}
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.offline-banner {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}

.update-notice {
  bottom: max(1rem, env(safe-area-inset-bottom));
}

.notice-enter-active {
  transition:
    opacity 250ms ease-out,
    transform 250ms ease-out;
}

.notice-leave-active {
  transition:
    opacity 150ms ease-in,
    transform 150ms ease-in;
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .notice-enter-active,
  .notice-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
