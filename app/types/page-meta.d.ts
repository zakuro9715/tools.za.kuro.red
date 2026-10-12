import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    descriptionKey?: string
    ogImage?: string
  }
}

declare module '#app' {
  interface PageMeta {
    titleKey?: string
    descriptionKey?: string
    ogImage?: string
  }
}

export {}
