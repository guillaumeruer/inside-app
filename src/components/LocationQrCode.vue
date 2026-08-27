<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeSvg } from 'qrcode.vue'

const props = defineProps<{
  locationName: string
  qrToken: string
}>()

const router = useRouter()
const panelVisible = ref(false)
const copied = ref(false)

const publicUrl = computed(() => {
  const resolved = router.resolve({
    name: 'public-location',
    params: {
      token: props.qrToken,
    },
  })

  const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin)

  return new URL(resolved.href, appBaseUrl).href
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    copied.value = true

    window.setTimeout(() => {
      copied.value = false
    }, 4000)
  } catch {
    copied.value = false
  }
}

function printQrCode() {
  window.print()
}
</script>

<template>
  <section class="mt-6">
    <button
      type="button"
      class="rounded-lg border border-slate-700 px-4 py-2.5 font-medium transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      :aria-expanded="panelVisible"
      aria-controls="location-qr-panel"
      @click="panelVisible = !panelVisible"
    >
      {{ panelVisible ? 'Masquer le QR code' : 'Afficher le QR code' }}
    </button>

    <div
      v-if="panelVisible"
      id="location-qr-panel"
      class="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div
        id="location-qr-label-preview"
        class="mx-auto flex max-w-sm flex-col items-center rounded-xl bg-white p-6 text-center text-slate-950"
      >
        <p class="text-sm font-semibold uppercase tracking-wide text-slate-600">Inside</p>

        <h2 class="mt-2 text-2xl font-bold">
          {{ locationName }}
        </h2>

        <div class="mt-5">
          <QrcodeSvg
            :value="publicUrl"
            :size="256"
            level="Q"
            :margin="4"
            foreground="#020617"
            background="#ffffff"
          />
        </div>

        <p class="mt-4 text-sm text-slate-600">Scannez pour consulter le contenu</p>
      </div>

      <p class="mt-5 break-all text-sm text-slate-400">
        {{ publicUrl }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          @click="printQrCode"
        >
          Imprimer l’étiquette
        </button>

        <button
          type="button"
          class="rounded-lg border border-slate-700 px-4 py-2.5 font-medium transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          @click="copyLink"
        >
          {{ copied ? 'Lien copié ✓' : 'Copier le lien' }}
        </button>
      </div>
    </div>
  </section>
  <Teleport to="body">
    <div v-if="panelVisible" id="location-qr-print-root" aria-hidden="true">
      <div
        id="location-qr-print-label"
        class="flex flex-col items-center rounded-xl bg-white p-6 text-center text-slate-950"
      >
        <p class="text-sm font-semibold uppercase tracking-wide text-slate-600">Inside</p>

        <h2 class="mt-2 text-2xl font-bold">
          {{ locationName }}
        </h2>

        <div class="mt-5">
          <QrcodeSvg
            :value="publicUrl"
            :size="256"
            level="Q"
            :margin="4"
            foreground="#020617"
            background="#ffffff"
          />
        </div>

        <p class="mt-4 text-sm text-slate-600">Scannez pour consulter le contenu</p>
      </div>
    </div>
  </Teleport>
</template>

<style>
#location-qr-print-root {
  display: none;
}

@media print {
  body > *:not(#location-qr-print-root) {
    display: none !important;
  }

  #location-qr-print-root {
    display: flex !important;
    width: 100%;
    justify-content: center;
    background: white;
  }

  #location-qr-print-label {
    width: 80mm;
    border: 1px solid #cbd5e1;
    color: #020617;
    break-inside: avoid;
  }

  @page {
    margin: 0;
  }

  #location-qr-print-root {
    box-sizing: border-box;
    padding: 12mm;
  }
}
</style>
