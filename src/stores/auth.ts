import type { Session } from '@supabase/supabase-js'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const initialized = ref(false)

  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => user.value !== null)

  async function initialize() {
    if (initialized.value) {
      return
    }

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    session.value = data.session

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      session.value = nextSession
    })
    initialized.value = true
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      throw error
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  return {
    session,
    user,
    initialized,
    isAuthenticated,
    initialize,
    signIn,
    signUp,
    signOut,
  }
})
