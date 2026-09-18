<script setup lang="ts">
const { t } = useI18n()
const {
  conversionSpeed,
  conversionPaceMinutes,
  conversionPaceSeconds,
  distance,
  paceMinutes,
  paceSeconds,
  timeHours,
  timeMinutes,
  timeSeconds,
  indicatorStates,
  paceTable,
  updatePaceFromSpeed,
  updateSpeedFromPace,
  registerInput,
  clearCalculation,
} = useWalkingCalc()

const indicatorLabels = computed(() => ({
  unfilled: t('indicators.unfilled'),
  inputted: t('indicators.inputted'),
  calculated: t('indicators.calculated'),
}))
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="grid gap-6 md:grid-cols-2">
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ t('conversion.title') }}
          </h2>
        </template>

        <div class="space-y-4">
          <UFormField
            name="conversion-speed"
            :label="t('conversion.speed')"
          >
            <UInput
              v-model="conversionSpeed"
              data-testid="walking-conversion-speed"
              type="number"
              min="0.1"
              step="0.1"
              :placeholder="t('conversion.speedPlaceholder')"
              @update:model-value="updatePaceFromSpeed"
            />
          </UFormField>
          <UIcon
            name="i-lucide-arrow-down-up"
            class="mx-auto block size-5 text-muted"
          />
          <div class="grid grid-cols-2 gap-3">
            <UFormField
              name="conversion-pace-minutes"
              :label="t('conversion.paceMinutes')"
            >
              <UInput
                v-model="conversionPaceMinutes"
                data-testid="walking-conversion-pace-minutes"
                type="number"
                min="0"
                :placeholder="t('conversion.minutesPlaceholder')"
                @update:model-value="updateSpeedFromPace"
              />
            </UFormField>
            <UFormField
              name="conversion-pace-seconds"
              :label="t('conversion.paceSeconds')"
            >
              <UInput
                v-model="conversionPaceSeconds"
                data-testid="walking-conversion-pace-seconds"
                type="number"
                min="0"
                max="59"
                :placeholder="t('conversion.secondsPlaceholder')"
                @update:model-value="updateSpeedFromPace"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold">
              {{ t('calculation.title') }}
            </h2>
            <UButton
              data-testid="walking-clear"
              :label="t('actions.clear')"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="clearCalculation"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UFormField
            name="distance"
            :label="t('calculation.distance')"
          >
            <template #hint>
              <span
                data-testid="walking-distance-indicator"
                class="text-xs text-muted"
              >{{ indicatorLabels[indicatorStates.distance] }}</span>
            </template>
            <UInput
              v-model="distance"
              data-testid="walking-distance"
              type="number"
              min="0"
              step="0.01"
              :placeholder="t('calculation.distancePlaceholder')"
              @update:model-value="registerInput('distance')"
            />
          </UFormField>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <span class="text-sm font-medium">{{ t('calculation.pace') }}</span>
              <span
                data-testid="walking-pace-indicator"
                class="text-xs text-muted"
              >{{ indicatorLabels[indicatorStates.pace] }}</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <UInput
                v-model="paceMinutes"
                data-testid="walking-pace-minutes"
                type="number"
                min="0"
                :placeholder="t('conversion.minutesPlaceholder')"
                :aria-label="t('calculation.paceMinutes')"
                @update:model-value="registerInput('pace')"
              />
              <UInput
                v-model="paceSeconds"
                data-testid="walking-pace-seconds"
                type="number"
                min="0"
                max="59"
                :placeholder="t('conversion.secondsPlaceholder')"
                :aria-label="t('calculation.paceSeconds')"
                @update:model-value="registerInput('pace')"
              />
            </div>
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <span class="text-sm font-medium">{{ t('calculation.time') }}</span>
              <span
                data-testid="walking-time-indicator"
                class="text-xs text-muted"
              >{{ indicatorLabels[indicatorStates.time] }}</span>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <UInput
                v-model="timeHours"
                data-testid="walking-time-hours"
                type="number"
                min="0"
                :placeholder="t('calculation.hoursPlaceholder')"
                :aria-label="t('calculation.hours')"
                @update:model-value="registerInput('time')"
              />
              <UInput
                v-model="timeMinutes"
                data-testid="walking-time-minutes"
                type="number"
                min="0"
                max="59"
                :placeholder="t('conversion.minutesPlaceholder')"
                :aria-label="t('calculation.minutes')"
                @update:model-value="registerInput('time')"
              />
              <UInput
                v-model="timeSeconds"
                data-testid="walking-time-seconds"
                type="number"
                min="0"
                max="59"
                :placeholder="t('conversion.secondsPlaceholder')"
                :aria-label="t('calculation.seconds')"
                @update:model-value="registerInput('time')"
              />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          {{ t('table.title') }}
        </h2>
      </template>

      <div class="max-h-100 overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 bg-default">
            <tr>
              <th class="p-3 font-medium">
                {{ t('table.speed') }}
              </th>
              <th class="p-3 font-medium">
                {{ t('table.pace') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="row in paceTable"
              :key="row.speed"
            >
              <td class="p-3">
                {{ t('table.speedValue', { speed: row.speed }) }}
              </td>
              <td class="p-3 text-muted">
                {{ t('table.paceValue', { pace: row.pace }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "conversion": {
      "title": "Speed and pace converter",
      "speed": "Speed (km/h)",
      "speedPlaceholder": "6.0",
      "paceMinutes": "Pace minutes per km",
      "paceSeconds": "Pace seconds per km",
      "minutesPlaceholder": "10",
      "secondsPlaceholder": "00"
    },
    "calculation": {
      "title": "Pace, distance, and time calculator",
      "distance": "Distance (km)",
      "distancePlaceholder": "5.00",
      "pace": "Pace",
      "paceMinutes": "Pace minutes",
      "paceSeconds": "Pace seconds",
      "time": "Time",
      "hours": "Hours",
      "minutes": "Minutes",
      "seconds": "Seconds",
      "hoursPlaceholder": "0"
    },
    "indicators": {
      "unfilled": "Not entered",
      "inputted": "Entered",
      "calculated": "Calculated"
    },
    "table": {
      "title": "Speed and pace reference (2.0–12.0 km/h)",
      "speed": "Speed",
      "pace": "Pace",
      "speedValue": "{speed} km/h",
      "paceValue": "{pace} /km"
    },
    "actions": {
      "clear": "Clear"
    }
  },
  "ja": {
    "conversion": {
      "title": "速度・ペース 相互変換",
      "speed": "時速（km/h）",
      "speedPlaceholder": "6.0",
      "paceMinutes": "ペース（分/km）",
      "paceSeconds": "ペース（秒/km）",
      "minutesPlaceholder": "10",
      "secondsPlaceholder": "00"
    },
    "calculation": {
      "title": "ペース・距離・時間 穴埋め",
      "distance": "距離（km）",
      "distancePlaceholder": "5.00",
      "pace": "ペース",
      "paceMinutes": "ペース（分）",
      "paceSeconds": "ペース（秒）",
      "time": "時間",
      "hours": "時間",
      "minutes": "分",
      "seconds": "秒",
      "hoursPlaceholder": "0"
    },
    "indicators": {
      "unfilled": "未入力",
      "inputted": "入力済",
      "calculated": "自動計算"
    },
    "table": {
      "title": "速度・ペース対応表（2.0–12.0 km/h）",
      "speed": "速度",
      "pace": "ペース",
      "speedValue": "{speed} km/h",
      "paceValue": "{pace} /km"
    },
    "actions": {
      "clear": "クリア"
    }
  }
}
</i18n>
