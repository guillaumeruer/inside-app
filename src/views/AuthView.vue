<template>
  <main class="flex min-h-screen items-center justify-center bg-bg px-4 py-12 text-text">
    <Card>
      <p class="text-sm font-semibold text-primary">Inside</p>

      <h1 class="mt-2 text-3xl font-bold">
        {{ mode === 'sign-in' ? 'Bon retour' : 'Créer un compte' }}
      </h1>

      <p class="mt-2 text-sm leading-6 text-text-secondary">
        {{
          mode === 'sign-in'
            ? 'Connectez-vous pour retrouver vos rangements.'
            : 'Commencez à organiser vos espaces et vos objets.'
        }}
      </p>

      <div class="mt-6 grid grid-cols-2 rounded-lg bg-bg p-1">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="
            mode === 'sign-in' ? 'bg-primary text-white' : 'text-primary hover:text-primary-hover'
          "
          @click="setMode('sign-in')"
        >
          Connexion
        </button>

        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="
            mode === 'sign-up' ? 'bg-primary text-white' : 'text-primary hover:text-primary-hover'
          "
          @click="setMode('sign-up')"
        >
          Inscription
        </button>
      </div>

      <form class="mt-6 space-y-5" novalidate @submit.prevent="handleSubmit">
        <InputGroup
          v-model="email"
          input-id="email"
          input-type="email"
          :input-error="emailError"
          :input-disabled="submitting"
          input-placeholder="vous@exemple.fr"
          input-autocomplete="email"
          @blur="emailTouched = true"
        >
          <template #label>Adresse email</template>
        </InputGroup>

        <InputGroup
          v-model="password"
          input-id="password"
          :input-type="showPassword ? 'text' : 'password'"
          :input-error="passwordError"
          :input-disabled="submitting"
          input-placeholder="vous@exemple.fr"
          :input-autocomplete="mode === 'sign-in' ? 'current-password' : 'new-password'"
          @blur="passwordTouched = true"
        >
          <template #label>Mot de passe</template>
        </InputGroup>

        <InputGroup
          v-if="mode === 'sign-up'"
          v-model="confirmPassword"
          input-id="confirm-password"
          :input-type="showPassword ? 'text' : 'password'"
          :input-error="confirmPasswordError"
          :input-disabled="submitting"
          input-placeholder="vous@exemple.fr"
          input-autocomplete=""
          @blur="confirmPasswordTouched = true"
        >
          <template #label>Confirmer le mot de passe</template>
        </InputGroup>

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

        <Button
          v-if="mode === 'sign-up'"
          type="button"
          variant="primary"
          class="mt-3 font-semibold text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          @click="setMode('sign-in')"
        >
          J’ai déjà un compte
        </Button>

        <Button type="submit" variant="primary" :disabled="submitting">
          {{
            submitting
              ? 'Veuillez patienter…'
              : mode === 'sign-in'
                ? 'Se connecter'
                : 'Créer mon compte'
          }}
        </Button>
      </form>
    </Card>
  </main>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import InputGroup from '@/components/InputGroup.vue'

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
