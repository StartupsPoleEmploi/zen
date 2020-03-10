const { addWeeks } = require('date-fns')

function computePeriods(queryParams) {
  const { first, second, duration } = queryParams

  const startFirstPeriod = new Date(first)
  const endFirstPeriod = addWeeks(startFirstPeriod, +duration)
  const startSecondPeriod = new Date(second)
  const endSecondPeriod = addWeeks(startSecondPeriod, +duration)

  return {
    startFirstPeriod,
    endFirstPeriod,
    startSecondPeriod,
    endSecondPeriod,
  }
}

function formatQueryResults(firstPeriodData, secondPeriodData) {
  const results = {
    firstPeriod: {},
    secondPeriod: {},
  }
  for (let i = 0; i < firstPeriodData.length; i++) {
    const { date, count: firstCount } = firstPeriodData[i]

    const secondPeriod = secondPeriodData[i] || {} // Security if no retrieve
    const { count: secondCount = 0 } = secondPeriod

    results.firstPeriod[date] = +firstCount
    results.secondPeriod[date] = +secondCount
  }
  return results
}

module.exports = {
  computePeriods,
  formatQueryResults,
}
