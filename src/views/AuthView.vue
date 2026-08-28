<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mode = ref<'sign-in' | 'sign-up'>('sign-in')
const email = ref('')
const password = ref('')
const emailTouched = ref(false)
const passwordTouched = ref(false)
const showPassword = ref(false)
const submitting = ref(false)
const formError = ref('')
const successMessage = ref('')
const confirmPassword = ref('')
const confirmPasswordTouched = ref(false)

const emailError = computed(() => {
  if (!emailTouched.value) return ''

  if (!email.value.trim()) {
    return 'Saisissez votre adresse email.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return 'Saisissez une adresse email valide.'
  }

  return ''
})

const passwordError = computed(() => {
  if (!passwordTouched.value) return ''

  if (!password.value) {
    return 'Saisissez votre mot de passe.'
  }

  if (password.value.length < 8) {
    return 'Utilisez au moins 8 caractères.'
  }

  return ''
})

const confirmPasswordError = computed(() => {
  if (mode.value !== 'sign-up' || !confirmPasswordTouched.value) {
    return ''
  }

  if (!confirmPassword.value) {
    return 'Confirmez votre mot de passe.'
  }

  if (confirmPassword.value !== password.value) {
    return 'Les mots de passe ne correspondent pas.'
  }

  return ''
})

function setMode(nextMode: 'sign-in' | 'sign-up') {
  mode.value = nextMode
  confirmPassword.value = ''
  confirmPasswordTouched.value = false
  formError.value = ''
  successMessage.value = ''
}

function readableError(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Une erreur inattendue est survenue. Réessayez.'
  }

  if (error.message === 'Invalid login credentials') {
    return 'Email ou mot de passe incorrect.'
  }

  if (error.message === 'User already registered') {
    return 'Un compte existe déjà avec cette adresse.'
  }

  return error.message
}

async function goAfterAuthentication() {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    await router.replace(redirect)
    return
  }

  await router.replace({ name: 'home' })
}

async function handleSubmit() {
  emailTouched.value = true
  passwordTouched.value = true
  confirmPasswordTouched.value = mode.value === 'sign-up'
  formError.value = ''
  successMessage.value = ''

  if (emailError.value || passwordError.value || confirmPasswordError.value) {
    return
  }

  submitting.value = true

  try {
    if (mode.value === 'sign-in') {
      await auth.signIn(email.value.trim(), password.value)
      await goAfterAuthentication()
      return
    }

    const data = await auth.signUp(email.value.trim(), password.value)

    if (data.session) {
      await goAfterAuthentication()
      return
    }

    successMessage.value =
      'Si cette adresse peut être utilisée, un email de confirmation a été envoyé. Si vous avez déjà un compte, passez à la connexion.'
  } catch (error) {
    formError.value = readableError(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
    <section
      class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8"
    >
      <p class="text-sm font-semibold text-emerald-400">Inside</p>

      <h1 class="mt-2 text-3xl font-bold">
        {{ mode === 'sign-in' ? 'Bon retour' : 'Créer un compte' }}
      </h1>

      <p class="mt-2 text-sm leading-6 text-slate-400">
        {{
          mode === 'sign-in'
            ? 'Connectez-vous pour retrouver vos rangements.'
            : 'Commencez à organiser vos espaces et vos objets.'
        }}
      </p>

      <div class="mt-6 grid grid-cols-2 rounded-lg bg-slate-950 p-1">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="
            mode === 'sign-in' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          "
          @click="setMode('sign-in')"
        >
          Connexion
        </button>

        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="
            mode === 'sign-up' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          "
          @click="setMode('sign-up')"
        >
          Inscription
        </button>
      </div>

      <form class="mt-6 space-y-5" novalidate @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium"> Adresse email </label>

          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            :disabled="submitting"
            :aria-invalid="Boolean(emailError)"
            :aria-describedby="emailError ? 'email-error' : undefined"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
            placeholder="vous@exemple.fr"
            @blur="emailTouched = true"
          />

          <p v-if="emailError" id="email-error" class="mt-2 text-sm text-red-400">
            {{ emailError }}
          </p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium"> Mot de passe </label>

          <div class="relative mt-2">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="mode === 'sign-in' ? 'current-password' : 'new-password'"
              :disabled="submitting"
              :aria-invalid="Boolean(passwordError)"
              :aria-describedby="passwordError ? 'password-error' : undefined"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 pr-20 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
              @blur="passwordTouched = true"
            />

            <button
              type="button"
              class="absolute inset-y-0 right-3 text-sm font-medium text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>

          <p v-if="passwordError" id="password-error" class="mt-2 text-sm text-red-400">
            {{ passwordError }}
          </p>
        </div>

        <div v-if="mode === 'sign-up'">
          <label for="confirm-password" class="block text-sm font-medium">
            Confirmer le mot de passe
          </label>

          <input
            id="confirm-password"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :disabled="submitting"
            :aria-invalid="Boolean(confirmPasswordError)"
            :aria-describedby="
              confirmPasswordError
                ? 'confirm-password-error'
                : confirmPasswordTouched
                  ? 'confirm-password-success'
                  : undefined
            "
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-wait disabled:bg-slate-900"
            @blur="confirmPasswordTouched = true"
          />

          <p
            v-if="confirmPasswordError"
            id="confirm-password-error"
            class="mt-2 text-sm text-red-400"
          >
            {{ confirmPasswordError }}
          </p>

          <p
            v-else-if="confirmPasswordTouched"
            id="confirm-password-success"
            class="mt-2 text-sm text-emerald-400"
          >
            Les mots de passe correspondent.
          </p>
        </div>

        <p
          v-if="formError"
          role="alert"
          class="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
        >
          {{ formError }}
        </p>

        <p
          v-if="successMessage"
          role="status"
          class="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"
        >
          {{ successMessage }}
        </p>

        <button
          v-if="mode === 'sign-up'"
          type="button"
          class="mt-3 font-semibold text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          @click="setMode('sign-in')"
        >
          J’ai déjà un compte
        </button>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-wait disabled:bg-emerald-800"
        >
          {{
            submitting
              ? 'Veuillez patienter…'
              : mode === 'sign-in'
                ? 'Se connecter'
                : 'Créer mon compte'
          }}
        </button>
      </form>
    </section>
  </main>
</template>
