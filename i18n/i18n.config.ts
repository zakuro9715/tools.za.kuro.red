import { messages } from '@/locales/messages'

export default defineI18nConfig(() => ({
  fallbackLocale: ['en', 'ja'],
  messages,
}))
