import { computed, onMounted, onUnmounted, reactive, shallowRef } from 'vue'

interface NetworkConnection extends EventTarget {
  effectiveType?: string
  downlink?: number
  saveData?: boolean
}

declare global {
  interface Navigator {
    connection?: NetworkConnection
    mozConnection?: NetworkConnection
    webkitConnection?: NetworkConnection
  }
}

export function useNetworkInfoChecker() {
  const status = shallowRef<'checking' | 'online' | 'offline' | 'error'>('checking')
  const ping = shallowRef<number | null>(null)
  const publicIp = shallowRef('')
  const isp = shallowRef('')
  const location = shallowRef('')
  const environment = reactive({ language: '', screen: '', userAgent: '' })
  const connection = reactive({ type: '', downlink: null as number | null, saveData: null as boolean | null, supported: false })
  let timer: ReturnType<typeof setInterval> | undefined
  let browserConnection: NetworkConnection | undefined

  const statusColor = computed(() => ({
    checking: 'bg-muted',
    online: 'bg-success',
    offline: 'bg-error',
    error: 'bg-warning',
  })[status.value])

  const updateConnection = () => {
    const browserConnection = (navigator.connection || navigator.mozConnection || navigator.webkitConnection) as NetworkConnection | undefined
    connection.supported = Boolean(browserConnection)
    connection.type = browserConnection?.effectiveType?.toUpperCase() || ''
    connection.downlink = browserConnection?.downlink ?? null
    connection.saveData = browserConnection?.saveData ?? null
  }

  const fetchPublicIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      if (!response.ok) throw new Error('IP lookup failed')
      const data = await response.json() as { ip?: string }
      publicIp.value = data.ip || ''
    } catch {
      publicIp.value = ''
    }

    if (!publicIp.value) {
      isp.value = ''
      location.value = ''
      return
    }

    try {
      const response = await fetch(`https://ipwho.is/${encodeURIComponent(publicIp.value)}`)
      const data = await response.json() as {
        success?: boolean
        city?: string
        country?: string
        connection?: { isp?: string, org?: string }
      }
      if (data.success === false) throw new Error('Location lookup failed')
      isp.value = data.connection?.isp || data.connection?.org || ''
      location.value = data.city && data.country ? `${data.city}, ${data.country}` : data.country || ''
    } catch {
      isp.value = ''
      location.value = ''
    }
  }

  const checkStatus = async () => {
    if (!navigator.onLine) {
      status.value = 'offline'
      ping.value = null
      return
    }
    const startedAt = performance.now()
    try {
      await fetch(`https://www.cloudflare.com/cdn-cgi/trace?cache=${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      })
      ping.value = Math.round(performance.now() - startedAt)
      status.value = 'online'
    } catch {
      ping.value = null
      status.value = 'error'
    }
  }

  const refresh = async () => {
    updateConnection()
    await Promise.all([fetchPublicIp(), checkStatus()])
  }
  const handleOnline = () => void refresh()

  onMounted(() => {
    environment.language = navigator.language || ''
    environment.screen = `${window.screen.width} x ${window.screen.height}`
    environment.userAgent = navigator.userAgent
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', checkStatus)
    browserConnection = (navigator.connection || navigator.mozConnection || navigator.webkitConnection) as NetworkConnection | undefined
    browserConnection?.addEventListener('change', updateConnection)
    timer = setInterval(() => void checkStatus(), 1000)
    void refresh()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', checkStatus)
    browserConnection?.removeEventListener('change', updateConnection)
    if (timer) clearInterval(timer)
  })

  return { status, statusColor, ping, publicIp, isp, location, environment, connection, refresh }
}
