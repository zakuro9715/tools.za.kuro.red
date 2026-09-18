import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { useSqliteViewer } from './useSqliteViewer'

const Harness = defineComponent({ setup: useSqliteViewer, template: '<div />' })

describe('useSqliteViewer', () => {
  it('requires a loaded database before running queries', async () => {
    const wrapper = await mountSuspended(Harness)
    wrapper.vm.sql = 'SELECT 1'
    wrapper.vm.runQuery()

    expect(wrapper.vm.error).toBe('file')
  })

  it('creates SQL snippets from the active table', async () => {
    const wrapper = await mountSuspended(Harness)
    wrapper.vm.insertSnippet('master')

    expect(wrapper.vm.sql).toBe('sqlite_master')
  })
})
