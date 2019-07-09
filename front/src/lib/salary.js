import { isObject } from 'lodash'

export const WORK_HOURS = 'workHours'
export const SALARY = 'salary'
export const MIN_SALARY = 1
export const MIN_WORK_HOURS = 1
export const MAX_SALARY = 99999
export const MAX_WORK_HOURS = 1000000 // Arbitrary high value so users aren't limited

export const calculateTotal = (employers, field, lowLimit, highLimit) => {
  const total = employers.reduce((prev, employer) => {
    const number = parseFloat(
      isObject(employer[field]) ? employer[field].value : employer[field],
    )
    if (number < lowLimit || number > highLimit) return NaN

    return number + prev
  }, 0)

  if (total < lowLimit || total > highLimit) return NaN

  return Math.round(total, 10)
}
