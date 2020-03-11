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

function formatQueryResults(firstPeriodData, secondPeriodData, accumulate) {
  const results = {
    firstPeriod: {},
    secondPeriod: {},
  }
  for (let i = 0; i < firstPeriodData.length; i++) {
    const { count: firstCount } = firstPeriodData[i]

    const label = `Jour ${i+1}`

    const secondPeriod = secondPeriodData[i] || {} // Security if no data retrieve
    const { count: secondCount = 0 } = secondPeriod

    if (accumulate) {
      // Get previous value
      const previousFirstPeriodValue = results.firstPeriod[`Jour ${i}`] || 0;
      const previousSecondPeriodValue = results.secondPeriod[`Jour ${i}`] || 0;

      results.firstPeriod[label] = previousFirstPeriodValue + Number(firstCount)
      results.secondPeriod[label] = previousSecondPeriodValue + Number(secondCount)
    } else {
      results.firstPeriod[label] = Number(firstCount)
      results.secondPeriod[label] = Number(secondCount)
    }
  }
  return results
}

module.exports = {
  computePeriods,
  formatQueryResults,
}
