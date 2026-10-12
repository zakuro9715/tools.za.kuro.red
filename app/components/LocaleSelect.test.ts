import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import LocaleSelect from './LocaleSelect.vue'

describe('LocaleSelect', () => {
  it('switches the active locale when another option is selected', async () => {
    const LocaleSelectHarness = defineComponent({
      setup() {
        const { locale, locales } = useI18n()
        const targetLocale = computed(() => locales.value.find(({ code }) => code !== locale.value))

        return () => h('div', [
          h('output', {
            'data-testid': 'active-locale',
            'data-target-name': targetLocale.value?.name,
            'data-target-code': targetLocale.value?.code,
          }, locale.value),
          h(LocaleSelect),
        ])
      },
    })
    const wrapper = await mountSuspended(LocaleSelectHarness)
    const activeLocale = wrapper.get('[data-testid="active-locale"]')
    const targetName = activeLocale.attributes('data-target-name')
    const targetCode = activeLocale.attributes('data-target-code')

    await wrapper.get('[data-testid="locale-select"]').trigger('click')

    const targetOption = Array.from(document.body.querySelectorAll('[data-slot="item"]'))
      .find(option => option.textContent?.trim() === targetName)
    expect(targetOption).toBeDefined()
    targetOption?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await flushPromises()

    expect(activeLocale.text()).toBe(targetCode)
  })
})
