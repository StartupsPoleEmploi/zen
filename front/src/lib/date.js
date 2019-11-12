import moment from 'moment'

export const formattedDeclarationMonth = (month) =>
  moment(month).format('MMMM YYYY')

export const formatDate = (date) => moment(date).format('DD/MM/YYYY')

export const formatIntervalDates = (startDate, endDate) => {
  const startString = moment(startDate).format('DD/MM/YYYY')
  if (!endDate) return `Du ${startString}`

  const endString = moment(endDate).format('DD/MM/YYYY')
  return `Du ${startString} au ${endString}`
}
