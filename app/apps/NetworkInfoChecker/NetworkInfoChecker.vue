<script setup lang="ts">
const { t } = useI18n()
const { status, statusColor, ping, publicIp, isp, location, environment, connection, refresh } = useNetworkInfoChecker()

const statusLabel = computed(() => t(`status.${status.value}`))
</script>

<template>
  <div class="space-y-4">
    <UCard data-testid="network-status">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-muted">
            {{ t('labels.status') }}
          </p>
          <div class="mt-1 flex items-center gap-3">
            <span
              class="size-3 rounded-full"
              :class="statusColor"
            />
            <h1 class="text-2xl font-bold text-highlighted">
              {{ statusLabel }}
            </h1>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs font-semibold text-muted">
            {{ t('labels.ping') }}
          </p>
          <p
            data-testid="network-ping"
            class="font-mono text-2xl font-bold"
          >
            {{ ping === null ? '-- ms' : `${ping} ms` }}
          </p>
        </div>
      </div>
      <template #footer>
        <UButton
          data-testid="network-refresh"
          icon="i-lucide-refresh-cw"
          :label="t('actions.refresh')"
          size="sm"
          variant="outline"
          color="neutral"
          @click="refresh"
        />
      </template>
    </UCard>

    <div class="grid gap-4 md:grid-cols-2">
      <UCard :title="t('sections.publicIp')">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.ipAddress') }}
            </dt><dd
              data-testid="network-ip"
              class="font-mono"
            >
              {{ publicIp || t('values.loading') }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.isp') }}
            </dt><dd>{{ isp || t('values.unknown') }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.location') }}
            </dt><dd>{{ location || t('values.unknown') }}</dd>
          </div>
        </dl>
      </UCard>
      <UCard :title="t('sections.connection')">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.connectionType') }}
            </dt><dd>{{ connection.supported ? connection.type || t('values.unknown') : t('values.unsupported') }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.downlink') }}
            </dt><dd class="font-mono">
              {{ connection.downlink === null ? t('values.unsupported') : `${connection.downlink} Mbps` }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.saveData') }}
            </dt><dd>{{ connection.saveData === null ? t('values.unsupported') : connection.saveData ? 'ON' : 'OFF' }}</dd>
          </div>
        </dl>
      </UCard>
      <UCard
        class="md:col-span-2"
        :title="t('sections.environment')"
      >
        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.language') }}
            </dt><dd>{{ environment.language || '--' }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('labels.screen') }}
            </dt><dd class="font-mono">
              {{ environment.screen || '--' }}
            </dd>
          </div>
          <div class="flex gap-4 sm:col-span-2">
            <dt class="shrink-0 text-muted">
              User Agent
            </dt><dd class="min-w-0 truncate font-mono text-xs">
              {{ environment.userAgent || '--' }}
            </dd>
          </div>
        </dl>
      </UCard>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "actions": { "refresh": "Refresh" },
    "labels": { "status": "STATUS", "ping": "PING", "ipAddress": "IP address", "isp": "Provider / ISP", "location": "Country / region", "connectionType": "Connection type", "downlink": "Estimated downlink", "saveData": "Data saver", "language": "Language", "screen": "Screen resolution" },
    "sections": { "publicIp": "Public IP", "connection": "Connection information", "environment": "Environment" },
    "status": { "checking": "Checking...", "online": "Online", "offline": "Offline", "error": "Connection error" },
    "values": { "loading": "Loading...", "unknown": "--", "unsupported": "Unsupported" }
  },
  "ja": {
    "actions": { "refresh": "更新" },
    "labels": { "status": "ステータス", "ping": "PING", "ipAddress": "IPアドレス", "isp": "プロバイダ / ISP", "location": "国 / 地域", "connectionType": "接続タイプ", "downlink": "推定下り速度", "saveData": "データ節約モード", "language": "言語", "screen": "画面解像度" },
    "sections": { "publicIp": "パブリックIP", "connection": "回線情報（推定）", "environment": "環境情報" },
    "status": { "checking": "確認中...", "online": "オンライン", "offline": "オフライン", "error": "接続エラー" },
    "values": { "loading": "取得中...", "unknown": "--", "unsupported": "非対応" }
  }
}
</i18n>
