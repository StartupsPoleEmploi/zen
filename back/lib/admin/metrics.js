const { addDays, format } = require('date-fns');

// prettier-ignore
function formatQueryResults({
  startFirstPeriod,
  firstPeriodData,
  startSecondPeriod,
  secondPeriodData,
}) {
  const hasSecondPeriod = secondPeriodData !== null;

  const byDayResults = { firstPeriod: {} };
  if (hasSecondPeriod) byDayResults.secondPeriod = {};

  const accumulatedResults = { firstPeriod: {} };
  if (hasSecondPeriod) accumulatedResults.secondPeriod = {};

  for (let i = 0; i < firstPeriodData.length; i += 1) {
    // Graph labels
    let label = format(addDays(startFirstPeriod, i), 'DD/MM');
    if (hasSecondPeriod) label += ` vs ${format(addDays(startSecondPeriod, i), 'DD/MM')}`;

    let labelPreviousDay = format(addDays(startFirstPeriod, i - 1), 'DD/MM');
    if (hasSecondPeriod) labelPreviousDay += ` vs ${format(addDays(startSecondPeriod, i - 1), 'DD/MM')}`;

    // First period
    const { count: firstCount = 0 } = firstPeriodData[i] || {};
    const previousFirstPeriodValue = accumulatedResults.firstPeriod[labelPreviousDay] || 0;
    accumulatedResults.firstPeriod[label] = previousFirstPeriodValue + Number(firstCount);
    byDayResults.firstPeriod[label] = Number(firstCount);

    // Second period
    if (hasSecondPeriod) {
      const { count: secondCount = 0 } = secondPeriodData[i] || {};
      const previousSecondPeriodValue = accumulatedResults.secondPeriod[labelPreviousDay] || 0;
      accumulatedResults.secondPeriod[label] = previousSecondPeriodValue + Number(secondCount);
      byDayResults.secondPeriod[label] = Number(secondCount);
    }
  }

  return {
    byDayResults,
    accumulatedResults,
  };
}

module.exports = {
  formatQueryResults,
};
