import { describe, expect, it } from 'vitest'
import { useWalkingCalc } from './useWalkingCalc'

describe('useWalkingCalc', () => {
  it('converts speed to pace and pace to speed', () => {
    const {
      conversionPaceMinutes,
      conversionPaceSeconds,
      conversionSpeed,
      updatePaceFromSpeed,
      updateSpeedFromPace,
    } = useWalkingCalc()

    conversionSpeed.value = '6'
    updatePaceFromSpeed()
    expect(conversionPaceMinutes.value).toBe('10')
    expect(conversionPaceSeconds.value).toBe('00')

    conversionPaceMinutes.value = '5'
    conversionPaceSeconds.value = '00'
    updateSpeedFromPace()
    expect(conversionSpeed.value).toBe('12.00')
  })

  it('calculates the remaining time from distance and pace', () => {
    const {
      distance,
      paceMinutes,
      paceSeconds,
      registerInput,
      timeHours,
      timeMinutes,
      timeSeconds,
    } = useWalkingCalc()

    distance.value = '5'
    registerInput('distance')
    paceMinutes.value = '10'
    paceSeconds.value = '00'
    registerInput('pace')

    expect(timeHours.value).toBe('0')
    expect(timeMinutes.value).toBe('50')
    expect(timeSeconds.value).toBe('00')
  })

  it('calculates distance and identifies it as calculated', () => {
    const { distance, indicatorStates, paceMinutes, registerInput, timeMinutes } = useWalkingCalc()

    paceMinutes.value = '10'
    registerInput('pace')
    timeMinutes.value = '30'
    registerInput('time')

    expect(distance.value).toBe('3.00')
    expect(indicatorStates.value.distance).toBe('calculated')
  })
})
