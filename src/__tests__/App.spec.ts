import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { RouterView } from 'vue-router'

import App from '../App.vue'

describe('App', () => {
  it('renders the current route', () => {
    const wrapper = shallowMount(App)

    expect(wrapper.findComponent(RouterView).exists()).toBe(true)
  })
})
