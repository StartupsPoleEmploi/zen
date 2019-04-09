import moment from 'moment'

export const formattedDeclarationMonth = (month) =>
  moment(month).format('MMMM YYYY')

export const formatIntervalDates = (startDate, endDate) => {
  const startString = moment(startDate).format('DD/MM/YYYY')
  const endString = moment(endDate).format('DD/MM/YYYY')
  return `Du ${startString} au ${endString}`
}
