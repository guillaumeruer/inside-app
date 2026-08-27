<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

async function handleSignOut() {
  await auth.signOut()
  await router.replace({ name: 'auth' })
}
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

      <section class="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h2 class="text-xl font-semibold">Aucun espace pour le moment</h2>

        <p class="mt-2 max-w-lg text-slate-400">
          Créez votre premier espace pour commencer à organiser vos emplacements et vos objets.
        </p>
      </section>
    </div>
  </main>
</template>
