import { computed, shallowRef } from 'vue'

type CalculationField = 'distance' | 'pace' | 'time'
type IndicatorState = 'unfilled' | 'inputted' | 'calculated'

export interface PaceTableRow {
  speed: string
  pace: string
}

function parseInteger(value: string): number {
  return Number.parseInt(value, 10)
}

function formatPace(totalMinutes: number): { minutes: string, seconds: string } {
  const minutes = Math.floor(totalMinutes)
  const seconds = Math.round((totalMinutes - minutes) * 60)

  return seconds === 60
    ? { minutes: String(minutes + 1), seconds: '00' }
    : { minutes: String(minutes), seconds: String(seconds).padStart(2, '0') }
}

export function useWalkingCalc() {
  const conversionSpeed = shallowRef('')
  const conversionPaceMinutes = shallowRef('')
  const conversionPaceSeconds = shallowRef('')
  const distance = shallowRef('')
  const paceMinutes = shallowRef('')
  const paceSeconds = shallowRef('')
  const timeHours = shallowRef('')
  const timeMinutes = shallowRef('')
  const timeSeconds = shallowRef('')
  const inputHistory = shallowRef<CalculationField[]>([])

  const hasDistance = () => distance.value !== '' && Number.parseFloat(distance.value) > 0
  const hasPace = () => paceMinutes.value !== '' && parseInteger(paceMinutes.value) >= 0
  const hasTime = () => {
    const hours = parseInteger(timeHours.value) || 0
    const minutes = parseInteger(timeMinutes.value) || 0
    const seconds = parseInteger(timeSeconds.value) || 0
    return hours > 0 || minutes > 0 || seconds > 0
  }

  const indicatorStates = computed<Record<CalculationField, IndicatorState>>(() => {
    const states: Record<CalculationField, IndicatorState> = {
      distance: hasDistance() ? 'inputted' : 'unfilled',
      pace: hasPace() ? 'inputted' : 'unfilled',
      time: hasTime() ? 'inputted' : 'unfilled',
    }

    if (inputHistory.value.length >= 2) {
      const [first, second] = inputHistory.value
      const target = (['distance', 'pace', 'time'] as CalculationField[])
        .find(field => field !== first && field !== second)

      if (target && states[first!] === 'inputted' && states[second!] === 'inputted') {
        states[target] = 'calculated'
      }
    }

    return states
  })

  const paceTable = computed<PaceTableRow[]>(() => {
    const rows: PaceTableRow[] = []
    for (let speed = 2; speed <= 12; speed += 0.5) {
      const pace = formatPace(60 / speed)
      rows.push({
        speed: speed.toFixed(1),
        pace: `${pace.minutes}:${pace.seconds}`,
      })
    }
    return rows
  })

  const updatePaceFromSpeed = () => {
    const speed = Number.parseFloat(conversionSpeed.value)
    if (Number.isNaN(speed) || speed <= 0) {
      conversionPaceMinutes.value = ''
      conversionPaceSeconds.value = ''
      return
    }

    const pace = formatPace(60 / speed)
    conversionPaceMinutes.value = pace.minutes
    conversionPaceSeconds.value = pace.seconds
  }

  const updateSpeedFromPace = () => {
    const minutes = parseInteger(conversionPaceMinutes.value)
    const seconds = parseInteger(conversionPaceSeconds.value) || 0

    if (Number.isNaN(minutes) || minutes < 0 || seconds < 0 || seconds >= 60) {
      conversionSpeed.value = ''
      return
    }

    const totalMinutes = minutes + seconds / 60
    conversionSpeed.value = totalMinutes === 0 ? '' : (60 / totalMinutes).toFixed(2)
  }

  const calculateRemaining = () => {
    if (inputHistory.value.length < 2) return

    const [first, second] = inputHistory.value
    const includes = (...fields: CalculationField[]) => fields.includes(first!) && fields.includes(second!)

    if (includes('pace', 'time') && hasPace() && hasTime()) {
      const paceInSeconds = (parseInteger(paceMinutes.value) || 0) * 60 + (parseInteger(paceSeconds.value) || 0)
      const totalTimeSeconds = (parseInteger(timeHours.value) || 0) * 3600
        + (parseInteger(timeMinutes.value) || 0) * 60
        + (parseInteger(timeSeconds.value) || 0)

      if (paceInSeconds > 0) {
        distance.value = (totalTimeSeconds / paceInSeconds).toFixed(2)
      }
      return
    }

    if (includes('distance', 'time') && hasDistance() && hasTime()) {
      const totalTimeSeconds = (parseInteger(timeHours.value) || 0) * 3600
        + (parseInteger(timeMinutes.value) || 0) * 60
        + (parseInteger(timeSeconds.value) || 0)
      const pace = formatPace(totalTimeSeconds / Number.parseFloat(distance.value))
      paceMinutes.value = pace.minutes
      paceSeconds.value = pace.seconds
      return
    }

    if (includes('distance', 'pace') && hasDistance() && hasPace()) {
      const paceInSeconds = (parseInteger(paceMinutes.value) || 0) * 60 + (parseInteger(paceSeconds.value) || 0)
      const totalTimeSeconds = Number.parseFloat(distance.value) * paceInSeconds
      const hours = Math.floor(totalTimeSeconds / 3600)
      const minutes = Math.floor((totalTimeSeconds % 3600) / 60)
      const seconds = Math.round(totalTimeSeconds % 60)

      timeHours.value = String(hours)
      timeMinutes.value = String(minutes)
      timeSeconds.value = String(seconds).padStart(2, '0')
    }
  }

  const registerInput = (field: CalculationField) => {
    inputHistory.value = [field, ...inputHistory.value.filter(item => item !== field)].slice(0, 3)
    calculateRemaining()
  }

  const clearCalculation = () => {
    distance.value = ''
    paceMinutes.value = ''
    paceSeconds.value = ''
    timeHours.value = ''
    timeMinutes.value = ''
    timeSeconds.value = ''
    inputHistory.value = []
  }

  return {
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
  }
}
