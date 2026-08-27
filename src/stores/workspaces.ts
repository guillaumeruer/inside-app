import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { supabase } from '@/lib/supabase'

export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

const workspaceColumns = `
  id,
  name,
  owner_id,
  created_at,
  updated_at
`

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Workspace[]>([])
  const currentWorkspaceId = ref<string | null>(null)
  const loading = ref(false)
  const creating = ref(false)
  const loadError = ref('')

  const currentWorkspace = computed(
    () => workspaces.value.find((workspace) => workspace.id === currentWorkspaceId.value) ?? null,
  )

  async function fetchWorkspaces() {
    loading.value = true
    loadError.value = ''

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(workspaceColumns)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      workspaces.value = (data ?? []) as Workspace[]

      const currenttStillExists = workspaces.value.some(
        (workspace) => workspace.id === currentWorkspaceId.value,
      )

      if (!currenttStillExists) {
        currentWorkspaceId.value = workspaces.value[0]?.id ?? null
      }
    } catch {
      loadError.value =
        'Impossible de charger vos espaces. Vérifiez votre connexion puis réessayez.'
    } finally {
      loading.value = false
    }
  }

  async function createWorkspace(name: string) {
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
        .from('workspaces')
        .insert({
          name: name.trim(),
          owner_id: user.id,
        })
        .select(workspaceColumns)
        .single()

      if (error) {
        throw error
      }

      const workspace = data as Workspace
      workspaces.value.push(workspace)
      currentWorkspaceId.value = workspace.id

      return workspace
    } finally {
      creating.value = false
    }
  }

  function selectWorkspace(workspaceId: string) {
    if (workspaces.value.some((workspace) => workspace.id === workspaceId)) {
      currentWorkspaceId.value = workspaceId
    }
  }

  function reset() {
    workspaces.value = []
    currentWorkspaceId.value = null
    loadError.value = ''
  }

  return {
    workspaces,
    currentWorkspaceId,
    currentWorkspace,
    loading,
    creating,
    loadError,
    fetchWorkspaces,
    createWorkspace,
    selectWorkspace,
    reset,
  }
})
