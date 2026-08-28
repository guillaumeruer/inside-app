import { ref } from 'vue'
import { defineStore } from 'pinia'

import { supabase } from '@/lib/supabase'

export interface Item {
  id: string
  workspace_id: string
  location_id: string
  name: string
  description: string | null
  quantity: number
  created_by: string
  created_at: string
  updated_at: string
}

interface ItemInput {
  name: string
  description: string
  quantity: number
}

const itemColumns = `
  id,
  workspace_id,
  location_id,
  name,
  description,
  quantity,
  created_by,
  created_at,
  updated_at
`

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const updatingItemId = ref<string | null>(null)
  const deletingItemId = ref<string | null>(null)
  const loadError = ref('')
  const loadedWorkspaceId = ref<string | null>(null)

  let pendingFetch: {
    workspaceId: string
    promise: Promise<void>
  } | null = null

  async function fetchItems(workspaceId: string) {
    loading.value = true
    loadError.value = ''

    try {
      const { data, error } = await supabase
        .from('items')
        .select(itemColumns)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      items.value = (data ?? []) as Item[]
      loadedWorkspaceId.value = workspaceId
    } catch {
      items.value = []
      loadError.value = 'Impossible de charger les objets. Vérifiez votre connexion puis réessayez.'
      loadedWorkspaceId.value = null
    } finally {
      loading.value = false
    }
  }

  function ensureItems(workspaceId: string) {
    if (loadedWorkspaceId.value === workspaceId) {
      return Promise.resolve()
    }

    if (pendingFetch?.workspaceId === workspaceId) {
      return pendingFetch.promise
    }

    const promise = fetchItems(workspaceId)

    pendingFetch = {
      workspaceId,
      promise,
    }

    return promise.finally(() => {
      if (pendingFetch?.promise === promise) {
        pendingFetch = null
      }
    })
  }

  async function createItem(workspaceId: string, locationId: string, input: ItemInput) {
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
        .from('items')
        .insert({
          workspace_id: workspaceId,
          location_id: locationId,
          name: input.name.trim(),
          description: input.description.trim() || null,
          quantity: input.quantity,
          created_by: user.id,
        })
        .select(itemColumns)
        .single()

      if (error) {
        throw error
      }

      const item = data as Item
      items.value.push(item)

      return item
    } finally {
      creating.value = false
    }
  }

  async function updateItem(workspaceId: string, itemId: string, input: ItemInput) {
    updatingItemId.value = itemId

    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          name: input.name.trim(),
          description: input.description.trim() || null,
          quantity: input.quantity,
        })
        .eq('id', itemId)
        .eq('workspace_id', workspaceId)
        .select(itemColumns)
        .single()

      if (error) {
        throw error
      }

      const updatedItem = data as Item
      const itemIndex = items.value.findIndex((item) => item.id === updatedItem.id)

      if (itemIndex !== -1) {
        items.value[itemIndex] = updatedItem
      }

      return updatedItem
    } finally {
      if (updatingItemId.value === itemId) {
        updatingItemId.value = null
      }
    }
  }

  async function deleteItem(workspaceId: string, itemId: string) {
    deletingItemId.value = itemId

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)
        .eq('workspace_id', workspaceId)
        .select('id')
        .single()

      if (error) {
        throw error
      }

      items.value = items.value.filter((item) => item.id !== itemId)
    } finally {
      if (deletingItemId.value === itemId) {
        deletingItemId.value = null
      }
    }
  }

  function reset() {
    items.value = []
    loadError.value = ''
    loadedWorkspaceId.value = null
    pendingFetch = null
  }

  return {
    items,
    loading,
    creating,
    updatingItemId,
    deletingItemId,
    loadError,
    fetchItems,
    ensureItems,
    createItem,
    updateItem,
    deleteItem,
    reset,
  }
})
