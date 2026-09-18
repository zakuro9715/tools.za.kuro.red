import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it } from 'vitest'
import PasswordGenerator from './PasswordGenerator.vue'

describe('PasswordGenerator', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates a strong password on load and changes it with a preset', async () => {
    const wrapper = await mountSuspended(PasswordGenerator)
    const output = wrapper.get('[data-testid="password-output"]')

    expect((output.element as HTMLInputElement).value).toHaveLength(32)

    await wrapper.get('[data-testid="password-preset-simple"]').trigger('click')
    expect((output.element as HTMLInputElement).value).toHaveLength(12)
    expect((output.element as HTMLInputElement).value).not.toMatch(/[-_!@#$%]/)
  })

  it('saves and deletes a custom preset', async () => {
    const wrapper = await mountSuspended(PasswordGenerator)

    await wrapper.get('[data-testid="password-preset-name"]').setValue('Personal')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.find('[data-testid="password-preset-Personal"]').exists()).toBe(true)
    expect(JSON.parse(localStorage.getItem('zakuro_pw_generator_custom_presets') ?? '[]')).toHaveLength(1)

    await wrapper.get('[data-testid="password-delete-preset-Personal"]').trigger('click')
    expect(wrapper.find('[data-testid="password-preset-Personal"]').exists()).toBe(false)
  })
})
