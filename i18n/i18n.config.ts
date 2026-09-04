import { messages as appsMessages } from '@/apps/locales/messages'

export default defineI18nConfig(() => ({
  fallbackLocale: ['en', 'ja'],
  messages: { ...appsMessages },
}))
