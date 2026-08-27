import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { supabase } from '@/lib/supabase'

export interface Location {
  id: string
  workspace_id: string
  parent_id: string | null
  name: string
  description: string | null
  qr_token: string
  created_by: string
  created_at: string
  updated_at: string
}

const locationColumns = `
  id,
  workspace_id,
  parent_id,
  name,
  description,
  qr_token,
  created_by,
  created_at,
  updated_at
`

export const useLocationsStore = defineStore('locations', () => {
  const locations = ref<Location[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const loadError = ref('')

  const byId = computed(() => new Map(locations.value.map((location) => [location.id, location])))

  async function fetchLocations(workspaceId: string) {
    loading.value = true
    loadError.value = ''

    try {
      const { data, error } = await supabase
        .from('locations')
        .select(locationColumns)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      locations.value = (data ?? []) as Location[]
    } catch {
      locations.value = []
      loadError.value =
        'Impossible de charger les emplacements. Vérifiez votre connexion puis réessayez.'
    } finally {
      loading.value = false
    }
  }

  async function createLocation(workspaceId: string, name: string, parentId: string | null = null) {
    creating.value = true

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Session utilisateur introuvable.')
      }

      const { data, error } = await supabase
        .from('locations')
        .insert({
          workspace_id: workspaceId,
          parent_id: parentId,
          name: name.trim(),
          description: null,
          created_by: user.id,
        })
        .select(locationColumns)
        .single()

      if (error) {
        throw error
      }

      const location = data as Location
      locations.value.push(location)

      return location
    } finally {
      creating.value = false
    }
  }

  function reset() {
    locations.value = []
    loadError.value = ''
  }

  return {
    locations,
    byId,
    loading,
    creating,
    loadError,
    fetchLocations,
    createLocation,
    reset,
  }
})
